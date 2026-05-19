// ** LIBS ** //
const crypto = require("crypto");

/**
 * Credential Encryption Utility
 * Provides methods for securely encrypting and decrypting credential data
 * Uses AES-256-GCM encryption with random initialization vectors
 */
class CredentialEncryption {
  static ALGORITHM = "aes-256-gcm";
  static IV_LENGTH = 16;
  static AUTH_TAG_LENGTH = 16;
  static KEY_LENGTH = 32; // 256 bits

  /**
   * Encrypts sensitive credential data
   * @param {Object} data - The data object to encrypt
   * @param {String} encryptionKey - The key to use for encryption (from env)
   * @returns {Object} - Object containing encrypted data and IV
   */
  static encrypt(data, encryptionKey) {
    try {
      // Derive a 32-byte key using SHA-256
      const key = crypto.createHash("sha256").update(encryptionKey).digest();

      // Generate a random IV
      const iv = crypto.randomBytes(this.IV_LENGTH);

      // Create cipher
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

      // Convert data to string if it's an object
      const dataString = typeof data === "object" ? JSON.stringify(data) : data;

      // Encrypt the data
      let encryptedData = cipher.update(dataString, "utf8", "hex");
      encryptedData += cipher.final("hex");

      // Get the auth tag
      const authTag = cipher.getAuthTag();

      return {
        encryptedData: encryptedData + authTag.toString("hex"),
        iv: iv.toString("hex"),
      };
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error("Failed to encrypt credential data");
    }
  }

  /**
   * Decrypts encrypted credential data
   * @param {String} encryptedData - The encrypted data as a hex string
   * @param {String} iv - The initialization vector as a hex string
   * @param {String} encryptionKey - The key used for encryption (from env)
   * @returns {Object} - Decrypted data object
   */
  static decrypt(encryptedData, iv, encryptionKey) {
    try {
      if (!encryptedData || !iv || !encryptionKey) {
        console.warn("Missing required parameters for decryption");
        return {}; // Return empty object instead of throwing
      }

      // Derive the same 32-byte key using SHA-256
      const key = crypto.createHash("sha256").update(encryptionKey).digest();

      // Convert IV from hex to Buffer
      const ivBuffer = Buffer.from(iv, "hex");

      // Validate that encryptedData has enough length to contain auth tag
      if (encryptedData.length < 32) {
        console.warn(
          `Encrypted data too short (${encryptedData.length} chars), needs at least 32 chars for auth tag`
        );
        return {}; // Return empty object instead of throwing
      }

      // Split the encrypted data and auth tag
      const authTag = Buffer.from(
        encryptedData.slice(-32), // Last 32 characters (16 bytes in hex)
        "hex"
      );
      const encryptedContent = encryptedData.slice(0, -32); // Everything except the last 32 characters

      // Create decipher
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, ivBuffer);
      decipher.setAuthTag(authTag);

      // Wrap the actual decryption in its own try-catch to handle authentication failures
      let decryptedData;
      try {
        // Decrypt the data
        decryptedData = decipher.update(encryptedContent, "hex", "utf8");
        decryptedData += decipher.final("utf8");
      } catch (decipherError) {
        // Handle authentication errors silently
        if (
          decipherError.message.includes("Unsupported state") ||
          decipherError.message.includes("authenticate")
        ) {
          // Just log a short message without the stack trace
          console.warn(
            "Authentication failed during decryption - possibly corrupted data"
          );
          return {};
        }
        // Let other errors propagate to outer catch
        throw decipherError;
      }

      // Parse the decrypted data if it's JSON
      try {
        return JSON.parse(decryptedData);
      } catch (parseError) {
        console.warn("Failed to parse decrypted data as JSON");
        return decryptedData;
      }
    } catch (error) {
      // Log a simplified error message without the full stack trace
      console.warn(`Decryption failed: ${error.message}`);
      // Return empty object instead of throwing exception
      return {};
    }
  }
}

module.exports = CredentialEncryption;
