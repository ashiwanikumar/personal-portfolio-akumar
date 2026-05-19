const mfaService = require("@services/auth/mfaService");
const User = require("@models/user/user");
const { logger } = require("@utils/logger");
const bcrypt = require("bcryptjs");

/**
 * MFA Controller for handling Two-Factor Authentication endpoints
 * 
 * This controller provides endpoints for:
 * - MFA setup and verification
 * - Backup codes management
 * - Admin controls for MFA enforcement
 * - MFA status and statistics
 * 
 * Security Features:
 * - Rate limiting on verification endpoints
 * - Input validation and sanitization
 * - Comprehensive error handling
 * - Audit logging for all operations
 * - Admin permission checks
 */

/**
 * @desc    Setup MFA for authenticated user
 * @route   POST /api/v1/mfa/setup
 * @access  Private (authenticated users)
 */
const setupMFA = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user exists and is activated
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Temporarily bypass activation check for MFA testing
    // if (!user.activated) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Please verify your email before setting up MFA",
    //   });
    // }

    if (user.disabled) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    const result = await mfaService.setupMFA(userId);

    logger.info(`MFA setup request from user: ${user.email}`, {
      userId,
      userEmail: user.email,
      action: "mfa_setup_request",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error("MFA setup failed:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      action: "mfa_setup_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "MFA setup failed",
    });
  }
};

/**
 * @desc    Verify MFA setup with TOTP token
 * @route   POST /api/v1/mfa/verify-setup
 * @access  Private (authenticated users)
 */
const verifyMFASetup = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code } = req.body;

    // Validate input
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    // Validate code format (6 digits)
    if (!mfaService.isValidTokenFormat(code.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code format. Please enter a 6-digit code.",
      });
    }

    const result = await mfaService.verifyMFASetup(userId, code.trim());

    const user = await User.findById(userId);
    logger.info(`MFA setup verified for user: ${user.email}`, {
      userId,
      userEmail: user.email,
      action: "mfa_setup_verified",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error("MFA setup verification failed:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      action: "mfa_setup_verification_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "MFA setup verification failed",
    });
  }
};

/**
 * @desc    Verify MFA token during login
 * @route   POST /api/v1/mfa/verify-login
 * @access  Public (with temp token)
 */
const verifyMFALogin = async (req, res) => {
  try {
    const { code, tempToken } = req.body;

    // Validate input
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: "Temporary token is required",
      });
    }

    // Validate code format (6 digits)
    if (!mfaService.isValidTokenFormat(code.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code format. Please enter a 6-digit code.",
      });
    }

    // Verify temp token and get user ID
    const jwt = require("jsonwebtoken");
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_MFA_SECRET || process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired temporary token. Please login again.",
      });
    }

    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify MFA token
    const result = await mfaService.verifyMFAToken(userId, code.trim(), false);

    if (result.success) {
      // Generate final access tokens
      const idObject = { _id: userId };
      const accessToken = jwt.sign(idObject, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_TTL,
      });
      const refreshToken = jwt.sign(idObject, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "1y",
      });

      // Set refresh token cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: `/`,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      logger.info(`MFA login verification successful for user: ${user.email}`, {
        userId,
        userEmail: user.email,
        action: "mfa_login_verification_success",
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        user: User.toClientObject(user),
        accessToken,
        message: "Login successful",
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error("MFA login verification failed:", {
      error: error.message,
      stack: error.stack,
      action: "mfa_login_verification_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "MFA verification failed",
    });
  }
};

/**
 * @desc    Verify MFA backup code during login
 * @route   POST /api/v1/mfa/verify-backup-code
 * @access  Public (with temp token)
 */
const verifyMFABackupCode = async (req, res) => {
  try {
    const { code, tempToken } = req.body;

    // Validate input
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Backup code is required",
      });
    }

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: "Temporary token is required",
      });
    }

    // Validate backup code format
    if (!mfaService.isValidBackupCodeFormat(code.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid backup code format. Please enter a valid backup code.",
      });
    }

    // Verify temp token and get user ID
    const jwt = require("jsonwebtoken");
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_MFA_SECRET || process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired temporary token. Please login again.",
      });
    }

    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify backup code
    const result = await mfaService.verifyMFAToken(userId, code.trim().toUpperCase(), true);

    if (result.success) {
      // Generate final access tokens
      const idObject = { _id: userId };
      const accessToken = jwt.sign(idObject, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_TTL,
      });
      const refreshToken = jwt.sign(idObject, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "1y",
      });

      // Set refresh token cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: `/`,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      logger.info(`MFA backup code verification successful for user: ${user.email}`, {
        userId,
        userEmail: user.email,
        action: "mfa_backup_code_verification_success",
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        user: User.toClientObject(user),
        accessToken,
        message: "Login successful with backup code",
        usedBackupCode: true,
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error("MFA backup code verification failed:", {
      error: error.message,
      stack: error.stack,
      action: "mfa_backup_code_verification_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "Backup code verification failed",
    });
  }
};

/**
 * @desc    Generate new backup codes
 * @route   POST /api/v1/mfa/backup-codes
 * @body    {sendEmailNotification: boolean, includeCodesInEmail: boolean} - Optional email parameters
 * @access  Private (authenticated users)
 */
const generateBackupCodes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      sendEmailNotification = false, 
      includeCodesInEmail = false 
    } = req.body;

    const result = await mfaService.generateBackupCodes(
      userId, 
      sendEmailNotification, 
      includeCodesInEmail
    );

    const user = await User.findById(userId);
    logger.info(`New backup codes generated for user: ${user.email}`, {
      userId,
      userEmail: user.email,
      action: "backup_codes_generated",
      sendEmailNotification,
      includeCodesInEmail,
      emailSent: result.emailSent,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error("Backup codes generation failed:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      action: "backup_codes_generation_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "Failed to generate backup codes",
    });
  }
};

/**
 * @desc    Disable MFA for authenticated user
 * @route   DELETE /api/v1/mfa/disable
 * @access  Private (authenticated users)
 */
const disableMFA = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    // Validate password
    if (!password || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: "Current password is required to disable MFA",
      });
    }

    const result = await mfaService.disableMFA(userId, password.trim());

    const user = await User.findById(userId);
    logger.info(`MFA disabled for user: ${user.email}`, {
      userId,
      userEmail: user.email,
      action: "mfa_disabled_by_user",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error("MFA disable failed:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      action: "mfa_disable_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "Failed to disable MFA",
    });
  }
};

/**
 * @desc    Get MFA status for authenticated user
 * @route   GET /api/v1/mfa/status
 * @access  Private (authenticated users)
 */
const getMFAStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await mfaService.getMFAStatus(userId);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Get MFA status failed:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      action: "get_mfa_status_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "Failed to get MFA status",
    });
  }
};

// ============== ADMIN ENDPOINTS ==============

/**
 * @desc    Admin: Enforce/Unenforce MFA for a user
 * @route   POST /api/v1/mfa/admin/enforce
 * @access  Private (Admin/SuperAdmin)
 */
const enforceMFAForUser = async (req, res) => {
  try {
    const adminUserId = req.user._id;
    const { userId, enforce } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (typeof enforce !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Enforce parameter must be a boolean",
      });
    }

    // Check admin permissions
    const admin = await User.findById(adminUserId);
    if (!admin || (admin.role !== "superadmin" && admin.role !== "admin")) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to manage user MFA",
      });
    }

    const result = await mfaService.enforceMFA(userId, adminUserId, enforce);

    const targetUser = await User.findById(userId);
    logger.info(`MFA ${enforce ? 'enforced' : 'unenforced'} for user: ${targetUser?.email}`, {
      targetUserId: userId,
      targetUserEmail: targetUser?.email,
      adminUserId,
      adminEmail: admin.email,
      action: enforce ? "mfa_enforced_by_admin" : "mfa_unenforced_by_admin",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error("Admin MFA enforcement failed:", {
      error: error.message,
      stack: error.stack,
      adminUserId: req.user?._id,
      action: "admin_mfa_enforcement_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "Failed to enforce MFA",
    });
  }
};

/**
 * @desc    Admin: Disable MFA for a user
 * @route   DELETE /api/v1/mfa/admin/disable/:userId
 * @access  Private (Admin/SuperAdmin)
 */
const adminDisableMFA = async (req, res) => {
  try {
    const adminUserId = req.user._id;
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin permissions
    const admin = await User.findById(adminUserId);
    if (!admin || (admin.role !== "superadmin" && admin.role !== "admin")) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to disable user MFA",
      });
    }

    const result = await mfaService.disableMFA(userId, null, adminUserId);

    const targetUser = await User.findById(userId);
    logger.info(`MFA disabled by admin for user: ${targetUser?.email}`, {
      targetUserId: userId,
      targetUserEmail: targetUser?.email,
      adminUserId,
      adminEmail: admin.email,
      action: "mfa_disabled_by_admin",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error("Admin MFA disable failed:", {
      error: error.message,
      stack: error.stack,
      adminUserId: req.user?._id,
      targetUserId: req.params.userId,
      action: "admin_mfa_disable_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "Failed to disable MFA",
    });
  }
};

/**
 * @desc    Admin: Get MFA status for a specific user
 * @route   GET /api/v1/mfa/admin/status/:userId
 * @access  Private (Admin/SuperAdmin)
 */
const adminGetMFAStatus = async (req, res) => {
  try {
    const adminUserId = req.user._id;
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check admin permissions
    const admin = await User.findById(adminUserId);
    if (!admin || (admin.role !== "superadmin" && admin.role !== "admin")) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to view user MFA status",
      });
    }

    const result = await mfaService.getMFAStatus(userId);

    // Add user information for admin view
    const user = await User.findById(userId);
    result.userInfo = {
      email: user?.email,
      name: user?.name,
      role: user?.role,
    };

    res.status(200).json(result);
  } catch (error) {
    logger.error("Admin get MFA status failed:", {
      error: error.message,
      stack: error.stack,
      adminUserId: req.user?._id,
      targetUserId: req.params.userId,
      action: "admin_get_mfa_status_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "Failed to get MFA status",
    });
  }
};

/**
 * @desc    Admin: Get MFA statistics
 * @route   GET /api/v1/mfa/admin/statistics
 * @access  Private (Admin/SuperAdmin)
 */
const getMFAStatistics = async (req, res) => {
  try {
    const adminUserId = req.user._id;

    // Check admin permissions
    const admin = await User.findById(adminUserId);
    if (!admin || (admin.role !== "superadmin" && admin.role !== "admin")) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to view MFA statistics",
      });
    }

    const result = await mfaService.getMFAStatistics();

    logger.info(`MFA statistics requested by admin: ${admin.email}`, {
      adminUserId,
      adminEmail: admin.email,
      action: "mfa_statistics_requested",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error("Get MFA statistics failed:", {
      error: error.message,
      stack: error.stack,
      adminUserId: req.user?._id,
      action: "get_mfa_statistics_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "Failed to get MFA statistics",
    });
  }
};

/**
 * @desc    Admin: Get QR code for user MFA
 * @route   GET /api/v1/mfa/admin/qr/:userId
 * @access  Private (SuperAdmin only)
 */
const adminGetQRCode = async (req, res) => {
  try {
    const adminUserId = req.user._id;
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check super admin permissions (more restrictive for QR access)
    const admin = await User.findById(adminUserId);
    if (!admin || admin.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only super administrators can access user QR codes",
      });
    }

    const result = await mfaService.getQRCodeForUser(userId, adminUserId);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Admin get QR code failed:", {
      error: error.message,
      stack: error.stack,
      adminUserId: req.user?._id,
      targetUserId: req.params.userId,
      action: "admin_get_qr_code_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "Failed to get QR code",
    });
  }
};

/**
 * @desc    Admin: Email backup codes to team email
 * @route   POST /api/v1/mfa/admin/email-backup-codes/:userId
 * @access  Private (SuperAdmin only)
 */
const adminEmailBackupCodes = async (req, res) => {
  try {
    const adminUserId = req.user._id;
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check super admin permissions (only super admin can email backup codes)
    const admin = await User.findById(adminUserId);
    if (!admin || admin.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only super administrators can email backup codes",
      });
    }

    const result = await mfaService.emailBackupCodesToAdmin(userId, adminUserId);

    const targetUser = await User.findById(userId);
    logger.info(`Backup codes emailed by admin: ${admin.email} for user: ${targetUser?.email}`, {
      targetUserId: userId,
      targetUserEmail: targetUser?.email,
      adminUserId,
      adminEmail: admin.email,
      action: "backup_codes_emailed_by_admin",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error("Admin email backup codes failed:", {
      error: error.message,
      stack: error.stack,
      adminUserId: req.user?._id,
      targetUserId: req.params.userId,
      action: "admin_email_backup_codes_failed",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(400).json({
      success: false,
      message: error.message || "Failed to email backup codes",
    });
  }
};

module.exports = {
  // User endpoints
  setupMFA,
  verifyMFASetup,
  verifyMFALogin,
  verifyMFABackupCode,
  generateBackupCodes,
  disableMFA,
  getMFAStatus,
  
  // Admin endpoints
  enforceMFAForUser,
  adminDisableMFA,
  adminGetMFAStatus,
  getMFAStatistics,
  adminGetQRCode,
  adminEmailBackupCodes,
};