const crypto = require('crypto');
const { execSync } = require('child_process');

let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp module not found. Image-specific security checks will be limited.');
  sharp = null;
}

const path = require('path');
const logger = require('@utils/logger');

/**
 * Content Security & Validation Utility
 * Handles malware scanning, content validation, and EXIF data sanitization
 */
class ContentSecurity {
  constructor() {
    // Malicious file signatures (basic detection)
    this.MALICIOUS_SIGNATURES = [
      // PHP shells
      '<?php', '<?=', '<script',
      // JavaScript
      '<script>', 'javascript:', 'eval(',
      // Common malware strings
      'base64_decode', 'exec(', 'system(',
      // Executable headers
      'MZ', 'PK', '\x7fELF'
    ];

    // Suspicious EXIF tags that should be removed
    this.SUSPICIOUS_EXIF_TAGS = [
      'gps', 'GPSInfo', 'UserComment', 'ImageDescription',
      'Artist', 'Copyright', 'Software', 'DateTime',
      'Make', 'Model', 'ProcessingSoftware'
    ];

    // Maximum file sizes (in bytes)
    this.MAX_FILE_SIZES = {
      image: 50 * 1024 * 1024, // 50MB
      video: 500 * 1024 * 1024, // 500MB
      document: 10 * 1024 * 1024 // 10MB
    };

    // Allowed MIME types
    this.ALLOWED_MIME_TYPES = {
      image: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'image/webp', 'image/avif', 'image/tiff', 'image/bmp'
      ],
      video: [
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
        'video/flv', 'video/webm', 'video/mkv', 'video/quicktime'
      ]
    };

    // File extension whitelist
    this.ALLOWED_EXTENSIONS = {
      image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.tiff', '.bmp'],
      video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.qt']
    };

    // Content analysis patterns
    this.CONTENT_PATTERNS = {
      inappropriate: [
        // Add patterns for inappropriate content detection
        // This is a basic example - in production, use AI services
      ],
      spam: [
        'viagra', 'casino', 'lottery', 'winner', 'congratulations',
        'click here', 'free money', 'earn money fast'
      ]
    };
  }

  /**
   * Comprehensive file validation
   */
  async validateFile(buffer, originalName, mimeType) {
    try {
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        fileInfo: {
          size: buffer.length,
          name: originalName,
          mimeType: mimeType,
          extension: path.extname(originalName).toLowerCase()
        },
        securityChecks: {
          malwareDetected: false,
          suspiciousContent: false,
          fileHeaderValid: true,
          sizeValid: true,
          extensionValid: true,
          mimeTypeValid: true
        }
      };

      // 1. File size validation
      const maxSize = this.getMaxFileSize(mimeType);
      if (buffer.length > maxSize) {
        validation.isValid = false;
        validation.errors.push(`File size exceeds maximum allowed (${this.formatBytes(maxSize)})`);
        validation.securityChecks.sizeValid = false;
      }

      // 2. File extension validation
      const fileType = this.getFileType(mimeType);
      const allowedExtensions = this.ALLOWED_EXTENSIONS[fileType] || [];
      if (!allowedExtensions.includes(validation.fileInfo.extension)) {
        validation.isValid = false;
        validation.errors.push(`File extension '${validation.fileInfo.extension}' is not allowed`);
        validation.securityChecks.extensionValid = false;
      }

      // 3. MIME type validation
      const allowedMimeTypes = this.ALLOWED_MIME_TYPES[fileType] || [];
      if (!allowedMimeTypes.includes(mimeType)) {
        validation.isValid = false;
        validation.errors.push(`MIME type '${mimeType}' is not allowed`);
        validation.securityChecks.mimeTypeValid = false;
      }

      // 4. File header validation (magic bytes)
      const headerValidation = await this.validateFileHeader(buffer, mimeType);
      if (!headerValidation.valid) {
        validation.isValid = false;
        validation.errors.push('File header does not match declared MIME type');
        validation.securityChecks.fileHeaderValid = false;
      }

      // 5. Malware detection
      const malwareDetection = await this.detectMalware(buffer, originalName);
      if (malwareDetection.detected) {
        validation.isValid = false;
        validation.errors.push('Potential malware detected');
        validation.securityChecks.malwareDetected = true;
      }

      // 6. Content analysis
      const contentAnalysis = await this.analyzeContent(buffer, mimeType);
      if (contentAnalysis.suspicious) {
        validation.warnings.push('Suspicious content patterns detected');
        validation.securityChecks.suspiciousContent = true;
      }

      // 7. Image-specific validations
      if (fileType === 'image') {
        const imageValidation = await this.validateImage(buffer);
        if (!imageValidation.valid) {
          validation.errors.push(...imageValidation.errors);
          if (imageValidation.errors.length > 0) {
            validation.isValid = false;
          }
        }
        validation.warnings.push(...imageValidation.warnings);
      }

      logger.info('File validation completed', {
        filename: originalName,
        isValid: validation.isValid,
        errors: validation.errors.length,
        warnings: validation.warnings.length
      });

      return validation;
    } catch (error) {
      logger.error('Error during file validation:', error);
      return {
        isValid: false,
        errors: ['File validation failed'],
        warnings: [],
        fileInfo: { size: buffer.length, name: originalName, mimeType },
        securityChecks: { malwareDetected: true }
      };
    }
  }

  /**
   * Detect potential malware in file content
   */
  async detectMalware(buffer, filename) {
    try {
      const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
      const binaryContent = buffer.toString('hex', 0, Math.min(buffer.length, 512));
      
      const detection = {
        detected: false,
        reasons: [],
        confidence: 0
      };

      // Check for malicious signatures in text content
      for (const signature of this.MALICIOUS_SIGNATURES) {
        if (content.toLowerCase().includes(signature.toLowerCase())) {
          detection.detected = true;
          detection.reasons.push(`Malicious signature detected: ${signature}`);
          detection.confidence += 30;
        }
      }

      // Check for executable file headers
      const executableHeaders = [
        '4d5a', // MZ (PE executable)
        '504b', // PK (ZIP-based, could be malicious archive)
        '7f454c46', // ELF executable
        'cafebabe', // Java class file
        'd0cf11e0' // Microsoft Office (could contain macros)
      ];

      for (const header of executableHeaders) {
        if (binaryContent.startsWith(header)) {
          detection.detected = true;
          detection.reasons.push(`Executable file header detected: ${header}`);
          detection.confidence += 50;
        }
      }

      // Check filename for suspicious patterns
      const suspiciousPatterns = [
        /\.php\./i, /\.asp\./i, /\.jsp\./i, /\.pl\./i,
        /\.exe$/i, /\.scr$/i, /\.bat$/i, /\.cmd$/i,
        /\.com$/i, /\.pif$/i, /\.vbs$/i, /\.js$/i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(filename)) {
          detection.detected = true;
          detection.reasons.push(`Suspicious filename pattern: ${pattern}`);
          detection.confidence += 25;
        }
      }

      // Use system antivirus if available (optional)
      try {
        if (process.platform === 'linux') {
          // Try to use ClamAV if available
          const clamavResult = await this.scanWithClamAV(buffer);
          if (clamavResult.infected) {
            detection.detected = true;
            detection.reasons.push('ClamAV detected malware');
            detection.confidence = 100;
          }
        }
      } catch (error) {
        logger.debug('ClamAV not available or failed:', error.message);
      }

      return detection;
    } catch (error) {
      logger.error('Error in malware detection:', error);
      return { detected: true, reasons: ['Malware detection failed'], confidence: 100 };
    }
  }

  /**
   * Scan with ClamAV (if available)
   */
  async scanWithClamAV(buffer) {
    try {
      // This requires ClamAV to be installed
      // echo buffer | clamdscan --fdpass
      const tempFile = `/tmp/upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      require('fs').writeFileSync(tempFile, buffer);
      
      const result = execSync(`clamdscan --no-summary ${tempFile}`, { timeout: 10000 });
      const output = result.toString();
      
      // Clean up temp file
      require('fs').unlinkSync(tempFile);
      
      return {
        infected: output.includes('FOUND'),
        result: output.trim()
      };
    } catch (error) {
      // ClamAV not available or scan failed
      throw error;
    }
  }

  /**
   * Validate file header (magic bytes)
   */
  async validateFileHeader(buffer, mimeType) {
    try {
      const header = buffer.toString('hex', 0, 16);
      
      const magicBytes = {
        'image/jpeg': ['ffd8ff'],
        'image/png': ['89504e47'],
        'image/gif': ['474946383761', '474946383961'],
        'image/webp': ['52494646'],
        'image/bmp': ['424d'],
        'image/tiff': ['49492a00', '4d4d002a'],
        'video/mp4': ['00000020667479704d534e56', '00000018667479706d703432'],
        'video/avi': ['52494646'],
        'video/mov': ['00000014667479707174'],
        'video/webm': ['1a45dfa3']
      };

      const expectedHeaders = magicBytes[mimeType];
      if (!expectedHeaders) {
        return { valid: true, message: 'No magic bytes validation available for this type' };
      }

      for (const expectedHeader of expectedHeaders) {
        if (header.toLowerCase().startsWith(expectedHeader)) {
          return { valid: true, message: 'File header matches MIME type' };
        }
      }

      return { valid: false, message: 'File header does not match declared MIME type' };
    } catch (error) {
      logger.error('Error validating file header:', error);
      return { valid: false, message: 'Header validation failed' };
    }
  }

  /**
   * Sanitize EXIF data from images
   */
  async sanitizeImageMetadata(buffer) {
    try {
      if (!sharp) {
        logger.warn('Sharp not available. Returning original image without metadata sanitization.');
        return buffer;
      }

      const result = await sharp(buffer)
        .withMetadata({
          exif: {}, // Remove all EXIF data
          iptc: {}, // Remove IPTC data
          xmp: {}, // Remove XMP data
          // Keep ICC color profile for proper color rendering
          icc: (await sharp(buffer).metadata()).icc
        })
        .toBuffer();

      logger.debug('Image metadata sanitized successfully');
      return result;
    } catch (error) {
      logger.error('Error sanitizing image metadata:', error);
      throw error;
    }
  }

  /**
   * Analyze content for inappropriate material
   */
  async analyzeContent(buffer, mimeType) {
    try {
      const analysis = {
        suspicious: false,
        reasons: [],
        confidence: 0
      };

      // For text-based analysis
      if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml')) {
        const content = buffer.toString('utf8').toLowerCase();
        
        // Check for spam patterns
        for (const pattern of this.CONTENT_PATTERNS.spam) {
          if (content.includes(pattern)) {
            analysis.suspicious = true;
            analysis.reasons.push(`Spam content detected: ${pattern}`);
            analysis.confidence += 20;
          }
        }
      }

      // For images, you could integrate with AI services for content moderation
      if (mimeType.startsWith('image/')) {
        // Placeholder for AI-based content analysis
        // In production, integrate with services like:
        // - AWS Rekognition
        // - Google Cloud Vision API
        // - Microsoft Azure Computer Vision
        // - Custom ML models
        
        // Basic check for common inappropriate file names
        const suspiciousKeywords = ['adult', 'xxx', 'porn', 'nude'];
        // This would be handled by the filename check in the calling function
      }

      return analysis;
    } catch (error) {
      logger.error('Error analyzing content:', error);
      return { suspicious: true, reasons: ['Content analysis failed'], confidence: 100 };
    }
  }

  /**
   * Image-specific validation
   */
  async validateImage(buffer) {
    try {
      const validation = {
        valid: true,
        errors: [],
        warnings: []
      };

      if (!sharp) {
        validation.warnings.push('Advanced image validation not available (Sharp module missing)');
        return validation;
      }

      const metadata = await sharp(buffer).metadata();
      
      // Check image dimensions
      if (!metadata.width || !metadata.height) {
        validation.valid = false;
        validation.errors.push('Invalid image dimensions');
      }

      // Check for reasonable dimensions
      if (metadata.width > 10000 || metadata.height > 10000) {
        validation.warnings.push('Very large image dimensions detected');
      }

      if (metadata.width < 10 || metadata.height < 10) {
        validation.warnings.push('Very small image dimensions detected');
      }

      // Check for valid format
      const supportedFormats = ['jpeg', 'png', 'gif', 'webp', 'avif', 'tiff', 'bmp'];
      if (!supportedFormats.includes(metadata.format)) {
        validation.valid = false;
        validation.errors.push(`Unsupported image format: ${metadata.format}`);
      }

      // Check for corrupted image
      try {
        await sharp(buffer).raw().toBuffer();
      } catch (error) {
        validation.valid = false;
        validation.errors.push('Image appears to be corrupted');
      }

      return validation;
    } catch (error) {
      return {
        valid: false,
        errors: ['Image validation failed'],
        warnings: []
      };
    }
  }

  /**
   * Generate content hash for duplicate detection
   */
  async generateContentHash(buffer) {
    try {
      // Generate multiple hashes for robust duplicate detection
      const md5 = crypto.createHash('md5').update(buffer).digest('hex');
      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
      
      // For images, generate perceptual hash
      let perceptualHash = null;
      if (sharp) {
        try {
          // Simple perceptual hash using image data
          const metadata = await sharp(buffer).metadata();
          if (metadata.format) {
            const thumbnail = await sharp(buffer)
              .resize(8, 8, { fit: 'fill' })
              .greyscale()
              .raw()
              .toBuffer();
            
            perceptualHash = crypto.createHash('md5').update(thumbnail).digest('hex');
          }
        } catch (error) {
          // Not an image or error processing
        }
      }

      return {
        md5,
        sha256,
        perceptualHash,
        size: buffer.length
      };
    } catch (error) {
      logger.error('Error generating content hash:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  getMaxFileSize(mimeType) {
    const fileType = this.getFileType(mimeType);
    return this.MAX_FILE_SIZES[fileType] || this.MAX_FILE_SIZES.document;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get security report
   */
  generateSecurityReport(validationResult) {
    return {
      timestamp: new Date().toISOString(),
      filename: validationResult.fileInfo.name,
      fileSize: this.formatBytes(validationResult.fileInfo.size),
      mimeType: validationResult.fileInfo.mimeType,
      isSecure: validationResult.isValid,
      securityIssues: validationResult.errors,
      warnings: validationResult.warnings,
      checks: validationResult.securityChecks
    };
  }
}

// Create singleton instance
const contentSecurity = new ContentSecurity();

module.exports = contentSecurity;