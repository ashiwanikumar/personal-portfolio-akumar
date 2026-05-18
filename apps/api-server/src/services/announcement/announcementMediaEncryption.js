const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { logger } = require('@utils/logger');

const ENCRYPTION_KEY = process.env.MEDIA_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const JWT_SECRET = process.env.MEDIA_JWT_SECRET || process.env.JWT_SECRET || 'your-media-jwt-secret';

// Verify encryption configuration on startup
if (!process.env.MEDIA_ENCRYPTION_KEY) {
  logger.warn('MEDIA_ENCRYPTION_KEY not set, using auto-generated key (will cause issues in clustered environments)');
}
if (!process.env.MEDIA_JWT_SECRET) {
  logger.warn('MEDIA_JWT_SECRET not set, using fallback JWT secret');
}
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Encrypts a media URL using AES-256-GCM
 * @param {string} url - The original media URL
 * @returns {string} - Base64 encoded encrypted URL with IV and auth tag
 */
function encryptMediaUrl(url) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha256');
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(url, 'utf8'),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    const combined = Buffer.concat([salt, iv, authTag, encrypted]);
    
    return combined.toString('base64url');
  } catch (error) {
    logger.error('Failed to encrypt media URL:', error);
    throw new Error('Media URL encryption failed');
  }
}

/**
 * Decrypts an encrypted media URL
 * @param {string} encryptedUrl - Base64 encoded encrypted URL
 * @returns {string} - Original media URL
 */
function decryptMediaUrl(encryptedUrl) {
  try {
    const combined = Buffer.from(encryptedUrl, 'base64url');
    
    if (combined.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1) {
      throw new Error(`Invalid encrypted data length: ${combined.length}, expected at least ${SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1}`);
    }
    
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha256');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    logger.error('Failed to decrypt media URL:', error.message);
    throw new Error('Media URL decryption failed');
  }
}

/**
 * Creates a JWT token for secure media access
 * @param {Object} mediaInfo - Media information
 * @param {string} mediaInfo.url - The encrypted media URL
 * @param {string} mediaInfo.fileType - Type of media (image/video)
 * @param {string} mediaInfo.announcementId - Associated announcement ID
 * @param {number} expiresIn - Token expiration in seconds (default: 1 hour)
 * @returns {string} - JWT token
 */
function createMediaAccessToken(mediaInfo, expiresIn = 3600) {
  try {
    const payload = {
      url: mediaInfo.url,
      fileType: mediaInfo.fileType,
      announcementId: mediaInfo.announcementId,
      timestamp: Date.now()
    };
    
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn,
      issuer: 'sschouhan-media-service'
    });
  } catch (error) {
    logger.error('Failed to create media access token:', error);
    throw new Error('Media token creation failed');
  }
}

/**
 * Verifies and decodes a media access token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded media information
 */
function verifyMediaAccessToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sschouhan-media-service'
    });
    
    return decoded;
  } catch (error) {
    logger.error('Failed to verify media access token:', error);
    throw new Error('Invalid or expired media token');
  }
}

/**
 * Generates a secure media URL with encrypted content and access token
 * @param {string} originalUrl - Original CloudFront URL
 * @param {Object} metadata - Additional metadata
 * @returns {Object} - Secure media access object
 */
function generateSecureMediaUrl(originalUrl, metadata = {}) {
  try {
    const encryptedUrl = encryptMediaUrl(originalUrl);
    
    const tokenData = {
      url: encryptedUrl,
      fileType: metadata.fileType || 'image',
      announcementId: metadata.announcementId,
      mimeType: metadata.mimeType
    };
    
    const accessToken = createMediaAccessToken(tokenData);
    
    // Return a structured object instead of direct URL
    return {
      token: accessToken,
      type: metadata.fileType || 'image',
      mime: metadata.mimeType
    };
  } catch (error) {
    logger.error('Failed to generate secure media URL:', error);
    throw error;
  }
}

/**
 * Validates and retrieves the original media URL from secure access data
 * @param {string} token - Media access token
 * @returns {Object} - Original media information
 */
function retrieveOriginalMediaUrl(token) {
  try {
    const decoded = verifyMediaAccessToken(token);
    const originalUrl = decryptMediaUrl(decoded.url);
    
    return {
      url: originalUrl,
      fileType: decoded.fileType,
      announcementId: decoded.announcementId,
      timestamp: decoded.timestamp
    };
  } catch (error) {
    logger.error('Failed to retrieve original media URL:', error);
    throw error;
  }
}

module.exports = {
  encryptMediaUrl,
  decryptMediaUrl,
  createMediaAccessToken,
  verifyMediaAccessToken,
  generateSecureMediaUrl,
  retrieveOriginalMediaUrl
};