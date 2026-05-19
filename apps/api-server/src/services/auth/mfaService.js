const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const crypto = require("crypto");
const User = require("@models/user/user");
const { logger } = require("@utils/logger");
const { 
  sendBackupCodesToEmail, 
  sendMFADisabledNotification,
  sendMFASetupNotification,
  sendBackupCodesRegeneratedNotification
} = require("@utils/mfa/sendMFAEmail");

/**
 * MFA Service for handling Two-Factor Authentication
 * 
 * This service provides comprehensive MFA functionality including:
 * - TOTP (Time-based One-Time Password) setup and verification
 * - QR code generation for authenticator apps
 * - Backup codes generation and management
 * - Admin controls for enforcing/disabling MFA
 * 
 * Security Features:
 * - Rate limiting for verification attempts
 * - Secure secret generation and storage
 * - Backup codes with single-use enforcement
 * - Admin override capabilities
 * - Comprehensive audit logging
 */
class MFAService {
  constructor() {
    this.serviceName = "MFAService";
    this.appName = process.env.APP_NAME || "SSC Dashboard";
    this.issuer = process.env.MFA_ISSUER || "SSC Dashboard";
  }

  /**
   * Setup MFA for a user
   * Generates a new secret and returns setup information
   * 
   * @param {string} userId - User ID
   * @returns {Object} Setup information including secret, QR code, and backup URL
   */
  async setupMFA(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if MFA is already enabled
      if (user.mfa && user.mfa.enabled) {
        throw new Error("MFA is already enabled for this user");
      }

      // Generate a new secret
      const secret = speakeasy.generateSecret({
        name: `${this.appName} (${user.email})`,
        issuer: this.issuer,
        length: 32, // 256-bit secret for enhanced security
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Store the secret temporarily (not enabled yet)
      await User.findByIdAndUpdate(userId, {
        "mfa.secret": secret.base32,
      });

      logger.info(`MFA setup initiated for user: ${user.email}`, {
        userId,
        action: "mfa_setup_initiated",
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        secret: secret.base32,
        qrCodeUrl,
        manualEntryKey: secret.base32,
        backupUrl: secret.otpauth_url,
        message: "MFA setup initiated. Please verify with your authenticator app to complete setup.",
      };
    } catch (error) {
      logger.error(`MFA setup failed for user ${userId}:`, {
        error: error.message,
        stack: error.stack,
        userId,
        action: "mfa_setup_failed",
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Verify MFA setup by validating the first TOTP code
   * Enables MFA if verification is successful
   * 
   * @param {string} userId - User ID
   * @param {string} token - TOTP token from authenticator app
   * @returns {Object} Verification result with backup codes
   */
  async verifyMFASetup(userId, token) {
    try {
      const user = await User.findById(userId).select("+mfa.secret");
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.mfa || !user.mfa.secret) {
        throw new Error("MFA setup not initiated. Please start setup first.");
      }

      if (user.mfa.enabled) {
        throw new Error("MFA is already enabled for this user");
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user.mfa.secret,
        encoding: "base32",
        token: token,
        window: 1, // Allow 1 time step tolerance (30 seconds before/after)
      });

      if (!verified) {
        logger.warn(`MFA setup verification failed for user: ${user.email}`, {
          userId,
          action: "mfa_setup_verification_failed",
          reason: "invalid_token",
          timestamp: new Date().toISOString(),
        });
        throw new Error("Invalid verification code. Please check your authenticator app and try again.");
      }

      // Generate backup codes
      const backupCodes = this._generateBackupCodes();

      // Enable MFA and store backup codes
      await User.findByIdAndUpdate(userId, {
        "mfa.enabled": true,
        "mfa.enabledAt": new Date(),
        "mfa.lastUsedAt": new Date(),
        "mfa.backupCodes": backupCodes.map(code => ({
          code: this.hashBackupCode(code),
          used: false,
          createdAt: new Date(),
        })),
      });

      // Send email notification
      try {
        const emailResult = await sendMFASetupNotification(user, user.email, user.name, userId);
        
        if (emailResult.success) {
          logger.info(`MFA enabled notification email sent to: ${user.email}`, {
            userId,
            action: "mfa_enabled_notification_sent",
            messageId: emailResult.messageId,
            timestamp: new Date().toISOString(),
          });
        } else {
          logger.warn(`Failed to send MFA enabled notification email to: ${user.email}`, {
            userId,
            error: emailResult.error,
            action: "mfa_enabled_notification_failed",
            timestamp: new Date().toISOString(),
          });
        }
      } catch (emailError) {
        // Don't fail the MFA setup operation if email fails
        logger.error(`Error sending MFA enabled notification email:`, {
          error: emailError.message,
          userId,
          action: "mfa_enabled_notification_error",
          timestamp: new Date().toISOString(),
        });
      }

      logger.info(`MFA setup completed for user: ${user.email}`, {
        userId,
        action: "mfa_setup_completed",
        backupCodesGenerated: backupCodes.length,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        backupCodes: backupCodes,
        message: "MFA has been successfully enabled for your account!",
      };
    } catch (error) {
      logger.error(`MFA setup verification failed for user ${userId}:`, {
        error: error.message,
        stack: error.stack,
        userId,
        action: "mfa_setup_verification_error",
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Verify TOTP token during login
   * 
   * @param {string} userId - User ID
   * @param {string} token - TOTP token or backup code
   * @param {boolean} isBackupCode - Whether the token is a backup code
   * @returns {Object} Verification result
   */
  async verifyMFAToken(userId, token, isBackupCode = false) {
    try {
      const user = await User.findById(userId).select("+mfa.secret +mfa.backupCodes");
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.mfa || !user.mfa.enabled) {
        throw new Error("MFA is not enabled for this user");
      }

      let verified = false;
      let usedBackupCode = false;

      if (isBackupCode) {
        // Verify backup code
        const result = await this.verifyBackupCode(user, token);
        verified = result.verified;
        usedBackupCode = result.usedBackupCode;
      } else {
        // Verify TOTP token
        verified = speakeasy.totp.verify({
          secret: user.mfa.secret,
          encoding: "base32",
          token: token,
          window: 1, // Allow 1 time step tolerance
        });
      }

      if (!verified) {
        logger.warn(`MFA verification failed for user: ${user.email}`, {
          userId,
          action: "mfa_verification_failed",
          isBackupCode,
          reason: "invalid_token",
          timestamp: new Date().toISOString(),
        });
        throw new Error("Invalid verification code");
      }

      // Update last used timestamp
      await User.findByIdAndUpdate(userId, {
        "mfa.lastUsedAt": new Date(),
      });

      logger.info(`MFA verification successful for user: ${user.email}`, {
        userId,
        action: "mfa_verification_success",
        isBackupCode,
        usedBackupCode,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        usedBackupCode,
        message: "MFA verification successful",
      };
    } catch (error) {
      logger.error(`MFA verification failed for user ${userId}:`, {
        error: error.message,
        stack: error.stack,
        userId,
        isBackupCode,
        action: "mfa_verification_error",
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Verify backup code
   * 
   * @param {Object} user - User document
   * @param {string} code - Backup code
   * @returns {Object} Verification result
   */
  async verifyBackupCode(user, code) {
    if (!user.mfa || !user.mfa.backupCodes || user.mfa.backupCodes.length === 0) {
      return { verified: false, usedBackupCode: false };
    }

    const hashedCode = this.hashBackupCode(code);

    // Find matching unused backup code
    const backupCodeIndex = user.mfa.backupCodes.findIndex(
      bc => bc.code === hashedCode && !bc.used
    );

    if (backupCodeIndex === -1) {
      return { verified: false, usedBackupCode: false };
    }

    // Mark the backup code as used
    await User.findByIdAndUpdate(user._id, {
      [`mfa.backupCodes.${backupCodeIndex}.used`]: true,
      [`mfa.backupCodes.${backupCodeIndex}.usedAt`]: new Date(),
    });

    return { verified: true, usedBackupCode: true };
  }

  /**
   * Generate new backup codes for a user
   * 
   * @param {string} userId - User ID
   * @param {boolean} sendEmailNotification - Whether to send email notification (default: false)
   * @param {boolean} includeCodesInEmail - Whether to include actual codes in email (default: false for security)
   * @returns {Object} New backup codes
   */
  async generateBackupCodes(userId, sendEmailNotification = false, includeCodesInEmail = false) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.mfa || !user.mfa.enabled) {
        throw new Error("MFA is not enabled for this user");
      }

      // Generate new backup codes
      const backupCodes = this._generateBackupCodes();

      // Replace old backup codes with new ones
      await User.findByIdAndUpdate(userId, {
        "mfa.backupCodes": backupCodes.map(code => ({
          code: this.hashBackupCode(code),
          used: false,
          createdAt: new Date(),
        })),
      });

      logger.info(`New backup codes generated for user: ${user.email}`, {
        userId,
        action: "backup_codes_regenerated",
        backupCodesGenerated: backupCodes.length,
        sendEmailNotification,
        includeCodesInEmail,
        timestamp: new Date().toISOString(),
      });

      // Send optional email notification
      if (sendEmailNotification) {
        try {
          const emailResult = await sendBackupCodesRegeneratedNotification(
            user, 
            backupCodes, 
            includeCodesInEmail
          );
          
          if (emailResult.success) {
            logger.info(`Backup codes regeneration notification email sent to: ${user.email}`, {
              userId,
              action: "backup_codes_regenerated_notification_sent",
              messageId: emailResult.messageId,
              includeCodesInEmail,
              timestamp: new Date().toISOString(),
            });
          } else {
            logger.warn(`Failed to send backup codes regeneration notification email to: ${user.email}`, {
              userId,
              error: emailResult.error,
              action: "backup_codes_regenerated_notification_failed",
              timestamp: new Date().toISOString(),
            });
          }
        } catch (emailError) {
          // Don't fail the backup codes generation if email fails
          logger.error(`Error sending backup codes regeneration notification email:`, {
            error: emailError.message,
            userId,
            action: "backup_codes_regenerated_notification_error",
            timestamp: new Date().toISOString(),
          });
        }
      }

      return {
        success: true,
        backupCodes: backupCodes,
        message: "New backup codes have been generated successfully",
        emailSent: sendEmailNotification,
      };
    } catch (error) {
      logger.error(`Backup codes generation failed for user ${userId}:`, {
        error: error.message,
        stack: error.stack,
        userId,
        action: "backup_codes_generation_error",
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Disable MFA for a user
   * 
   * @param {string} userId - User ID
   * @param {string} password - User's current password for verification
   * @param {string} adminUserId - Admin user ID (if disabled by admin)
   * @returns {Object} Disable result
   */
  async disableMFA(userId, password = null, adminUserId = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.mfa || !user.mfa.enabled) {
        throw new Error("MFA is not enabled for this user");
      }

      // Check if MFA is enforced and user is trying to disable it themselves
      if (user.mfa.enforced && !adminUserId) {
        throw new Error("MFA is enforced by administrator and cannot be disabled");
      }

      // If not disabled by admin, verify password
      if (!adminUserId && password) {
        const bcrypt = require("bcryptjs");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new Error("Invalid password");
        }
      }

      // Disable MFA
      await User.findByIdAndUpdate(userId, {
        "mfa.enabled": false,
        "mfa.secret": undefined,
        "mfa.backupCodes": [],
        "mfa.lastUsedAt": undefined,
        "mfa.recoveryEmail": undefined,
      });

      const actionBy = adminUserId ? "admin" : "user";
      
      // Send email notification
      try {
        let adminData = null;
        if (adminUserId) {
          adminData = await User.findById(adminUserId);
        }
        
        const emailResult = await sendMFADisabledNotification(user, actionBy, adminData);
        
        if (emailResult.success) {
          logger.info(`MFA disabled notification email sent to: ${user.email}`, {
            userId,
            action: "mfa_disabled_notification_sent",
            messageId: emailResult.messageId,
            timestamp: new Date().toISOString(),
          });
        } else {
          logger.warn(`Failed to send MFA disabled notification email to: ${user.email}`, {
            userId,
            error: emailResult.error,
            action: "mfa_disabled_notification_failed",
            timestamp: new Date().toISOString(),
          });
        }
      } catch (emailError) {
        // Don't fail the MFA disable operation if email fails
        logger.error(`Error sending MFA disabled notification email:`, {
          error: emailError.message,
          userId,
          action: "mfa_disabled_notification_error",
          timestamp: new Date().toISOString(),
        });
      }
      
      logger.info(`MFA disabled for user: ${user.email}`, {
        userId,
        action: "mfa_disabled",
        disabledBy: actionBy,
        adminUserId,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: `MFA has been successfully disabled ${adminUserId ? 'by administrator' : ''}`,
      };
    } catch (error) {
      logger.error(`MFA disable failed for user ${userId}:`, {
        error: error.message,
        stack: error.stack,
        userId,
        adminUserId,
        action: "mfa_disable_error",
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Get MFA status for a user
   * 
   * @param {string} userId - User ID
   * @returns {Object} MFA status information
   */
  async getMFAStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const status = {
        success: true,
        enabled: user.mfa?.enabled || false,
        enforced: user.mfa?.enforced || false,
        enabledAt: user.mfa?.enabledAt,
        lastUsedAt: user.mfa?.lastUsedAt,
        hasValidBackupCodes: user.hasValidBackupCodes(),
        backupCodesCount: user.getValidBackupCodes().length,
        canDisable: user.canDisableMFA(),
        recoveryEmail: user.mfa?.recoveryEmail,
      };

      return status;
    } catch (error) {
      logger.error(`Get MFA status failed for user ${userId}:`, {
        error: error.message,
        stack: error.stack,
        userId,
        action: "get_mfa_status_error",
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Admin: Enforce MFA for a user
   * 
   * @param {string} userId - User ID
   * @param {string} adminUserId - Admin user ID
   * @param {boolean} enforce - Whether to enforce MFA
   * @returns {Object} Enforcement result
   */
  async enforceMFA(userId, adminUserId, enforce = true) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const admin = await User.findById(adminUserId);
      if (!admin) {
        throw new Error("Admin user not found");
      }

      // Check if admin has permission (should be checked at controller level too)
      if (admin.role !== "superadmin" && admin.role !== "admin") {
        throw new Error("Insufficient permissions to enforce MFA");
      }

      await User.findByIdAndUpdate(userId, {
        "mfa.enforced": enforce,
      });

      logger.info(`MFA ${enforce ? 'enforced' : 'unenforced'} for user: ${user.email}`, {
        userId,
        adminUserId,
        action: enforce ? "mfa_enforced" : "mfa_unenforced",
        enforcedBy: admin.email,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: `MFA has been ${enforce ? 'enforced' : 'removed from enforcement'} for the user`,
      };
    } catch (error) {
      logger.error(`MFA enforcement failed for user ${userId}:`, {
        error: error.message,
        stack: error.stack,
        userId,
        adminUserId,
        enforce,
        action: "mfa_enforcement_error",
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Generate backup codes (helper method)
   * 
   * @param {number} count - Number of backup codes to generate
   * @returns {Array} Array of backup codes
   */
  _generateBackupCodes(count = 8) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      // Format as XXXX-XXXX for better readability
      const formattedCode = `${code.substring(0, 4)}-${code.substring(4, 8)}`;
      codes.push(formattedCode);
    }
    return codes;
  }

  /**
   * Hash backup code for secure storage
   * 
   * @param {string} code - Plain text backup code
   * @returns {string} Hashed backup code
   */
  hashBackupCode(code) {
    return crypto.createHash("sha256").update(code).digest("hex");
  }

  /**
   * Get MFA statistics for admin dashboard
   * 
   * @returns {Object} MFA statistics
   */
  async getMFAStatistics() {
    try {
      const totalUsers = await User.countDocuments();
      const mfaEnabledUsers = await User.countDocuments({ "mfa.enabled": true });
      const mfaEnforcedUsers = await User.countDocuments({ "mfa.enforced": true });
      const recentMFASetups = await User.countDocuments({
        "mfa.enabledAt": { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      return {
        success: true,
        statistics: {
          totalUsers,
          mfaEnabledUsers,
          mfaEnforcedUsers,
          recentMFASetups,
          mfaAdoptionRate: totalUsers > 0 ? ((mfaEnabledUsers / totalUsers) * 100).toFixed(2) : 0,
          enforcementRate: totalUsers > 0 ? ((mfaEnforcedUsers / totalUsers) * 100).toFixed(2) : 0,
        }
      };
    } catch (error) {
      logger.error("Get MFA statistics failed:", {
        error: error.message,
        stack: error.stack,
        action: "get_mfa_statistics_error",
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Validate TOTP token format
   * 
   * @param {string} token - TOTP token
   * @returns {boolean} Whether token format is valid
   */
  isValidTokenFormat(token) {
    return /^\d{6}$/.test(token);
  }

  /**
   * Validate backup code format
   * 
   * @param {string} code - Backup code
   * @returns {boolean} Whether backup code format is valid
   */
  isValidBackupCodeFormat(code) {
    return /^[A-F0-9]{4}-[A-F0-9]{4}$/.test(code.toUpperCase());
  }

  /**
   * Get QR code for existing MFA setup (admin use)
   * 
   * @param {string} userId - User ID
   * @param {string} adminUserId - Admin user ID
   * @returns {Object} QR code information
   */
  async getQRCodeForUser(userId, adminUserId) {
    try {
      const user = await User.findById(userId).select("+mfa.secret");
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.mfa || !user.mfa.enabled || !user.mfa.secret) {
        throw new Error("MFA is not enabled for this user");
      }

      // Verify admin permissions
      const admin = await User.findById(adminUserId);
      if (!admin || (admin.role !== "superadmin" && admin.role !== "admin")) {
        throw new Error("Insufficient permissions");
      }

      // Recreate the secret object for QR generation
      const otpAuthUrl = speakeasy.otpauthURL({
        secret: user.mfa.secret,
        label: `${this.appName} (${user.email})`,
        issuer: this.issuer,
        encoding: "base32"
      });

      const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

      logger.info(`QR code generated for user: ${user.email} by admin: ${admin.email}`, {
        userId,
        adminUserId,
        action: "qr_code_generated",
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        qrCodeUrl,
        manualEntryKey: user.mfa.secret,
        message: "QR code generated successfully",
      };
    } catch (error) {
      logger.error(`QR code generation failed for user ${userId}:`, {
        error: error.message,
        stack: error.stack,
        userId,
        adminUserId,
        action: "qr_code_generation_error",
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Email backup codes to admin's team email
   * 
   * @param {string} userId - User ID
   * @param {string} adminUserId - Admin user ID
   * @returns {Object} Email send result
   */
  async emailBackupCodesToAdmin(userId, adminUserId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.mfa || !user.mfa.enabled) {
        throw new Error("MFA is not enabled for this user");
      }

      // Verify admin permissions - only super admin can email backup codes
      const admin = await User.findById(adminUserId);
      if (!admin || admin.role !== "superadmin") {
        throw new Error("Only super administrators can email backup codes");
      }

      if (!admin.email) {
        throw new Error("Admin email not found");
      }

      // Generate new backup codes for security
      const newBackupCodes = this._generateBackupCodes();

      // Update user with new backup codes
      await User.findByIdAndUpdate(userId, {
        "mfa.backupCodes": newBackupCodes.map(code => ({
          code: this.hashBackupCode(code),
          used: false,
          createdAt: new Date(),
        })),
      });

      // Send email with backup codes
      const emailResult = await sendBackupCodesToEmail(
        user,
        newBackupCodes,
        admin.email,
        admin.name,
        adminUserId
      );

      if (emailResult.success) {
        logger.info(`Backup codes emailed to admin: ${admin.email} for user: ${user.email}`, {
          userId,
          adminUserId,
          adminEmail: admin.email,
          userEmail: user.email,
          backupCodesCount: newBackupCodes.length,
          action: "backup_codes_emailed",
          messageId: emailResult.messageId,
          timestamp: new Date().toISOString(),
        });

        return {
          success: true,
          message: `Backup codes have been sent to ${admin.email}`,
          emailSent: true,
          adminEmail: admin.email,
          backupCodesGenerated: newBackupCodes.length,
        };
      } else {
        throw new Error(emailResult.error || "Failed to send email");
      }
    } catch (error) {
      logger.error(`Email backup codes failed for user ${userId}:`, {
        error: error.message,
        stack: error.stack,
        userId,
        adminUserId,
        action: "email_backup_codes_error",
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}

module.exports = new MFAService();