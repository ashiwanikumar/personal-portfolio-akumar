const express = require("express");
const router = express.Router();

// Controllers
const {
  setupMFA,
  verifyMFASetup,
  verifyMFALogin,
  verifyMFABackupCode,
  generateBackupCodes,
  disableMFA,
  getMFAStatus,
  enforceMFAForUser,
  adminDisableMFA,
  adminGetMFAStatus,
  getMFAStatistics,
  adminGetQRCode,
  adminEmailBackupCodes,
} = require("@controllers/auth/mfaController");

// Middlewares
const { authCheck: auth } = require("@middlewares/auth");
const {
  mfaVerificationLimiter,
  mfaSetupLimiter,
  backupCodeLimiter,
  adminMFALimiter,
  validateMFARequest,
  logMFARequest,
  checkMFAEnforcement,
  requireAdminForMFA,
  requireSuperAdminForMFA,
} = require("@middlewares/mfaMiddleware");

/**
 * MFA Routes for Two-Factor Authentication
 * 
 * User Routes:
 * - POST /setup - Setup MFA for user
 * - POST /verify-setup - Verify MFA setup
 * - POST /verify-login - Verify MFA during login (public)
 * - POST /verify-backup-code - Verify backup code during login (public)
 * - POST /backup-codes - Generate new backup codes
 * - DELETE /disable - Disable MFA for user
 * - GET /status - Get MFA status
 * 
 * Admin Routes:
 * - POST /admin/enforce - Enforce/unenforce MFA for user
 * - DELETE /admin/disable/:userId - Disable MFA for user (admin)
 * - GET /admin/status/:userId - Get MFA status for user (admin)
 * - GET /admin/statistics - Get MFA statistics
 * - GET /admin/qr/:userId - Get QR code for user (super admin only)
 * - POST /admin/email-backup-codes/:userId - Email backup codes to team email (super admin only)
 */

// ============== USER ROUTES ==============

/**
 * @desc    Setup MFA for authenticated user
 * @route   POST /api/v1/mfa/setup
 * @access  Private (authenticated users)
 */
router.post(
  "/mfa/setup",
  auth,
  mfaSetupLimiter,
  logMFARequest,
  setupMFA
);

/**
 * @desc    Verify MFA setup with TOTP token
 * @route   POST /api/v1/mfa/verify-setup
 * @access  Private (authenticated users)
 */
router.post(
  "/mfa/verify-setup",
  auth,
  mfaVerificationLimiter,
  validateMFARequest,
  logMFARequest,
  verifyMFASetup
);

/**
 * @desc    Verify MFA token during login
 * @route   POST /api/v1/mfa/verify-login
 * @access  Public (with temp token)
 */
router.post(
  "/mfa/verify-login",
  mfaVerificationLimiter,
  validateMFARequest,
  logMFARequest,
  verifyMFALogin
);

/**
 * @desc    Verify MFA backup code during login
 * @route   POST /api/v1/mfa/verify-backup-code
 * @access  Public (with temp token)
 */
router.post(
  "/mfa/verify-backup-code",
  mfaVerificationLimiter,
  validateMFARequest,
  logMFARequest,
  verifyMFABackupCode
);

/**
 * @desc    Generate new backup codes
 * @route   POST /api/v1/mfa/backup-codes
 * @access  Private (authenticated users)
 */
router.post(
  "/mfa/backup-codes",
  auth,
  backupCodeLimiter,
  logMFARequest,
  generateBackupCodes
);

/**
 * @desc    Disable MFA for authenticated user
 * @route   POST /api/v1/mfa/disable
 * @access  Private (authenticated users)
 */
router.post(
  "/mfa/disable",
  auth,
  checkMFAEnforcement, // Prevent disabling enforced MFA
  logMFARequest,
  disableMFA
);

/**
 * @desc    Get MFA status for authenticated user
 * @route   GET /api/v1/mfa/status
 * @access  Private (authenticated users)
 */
router.get(
  "/mfa/status",
  auth,
  getMFAStatus
);

// ============== ADMIN ROUTES ==============

/**
 * @desc    Admin: Enforce/Unenforce MFA for a user
 * @route   POST /api/v1/mfa/admin/enforce
 * @access  Private (Admin/SuperAdmin)
 */
router.post(
  "/mfa/admin/enforce",
  auth,
  requireAdminForMFA,
  adminMFALimiter,
  logMFARequest,
  enforceMFAForUser
);

/**
 * @desc    Admin: Disable MFA for a user
 * @route   DELETE /api/v1/mfa/admin/disable/:userId
 * @access  Private (Admin/SuperAdmin)
 */
router.delete(
  "/mfa/admin/disable/:userId",
  auth,
  requireAdminForMFA,
  adminMFALimiter,
  logMFARequest,
  adminDisableMFA
);

/**
 * @desc    Admin: Get MFA status for a specific user
 * @route   GET /api/v1/mfa/admin/status/:userId
 * @access  Private (Admin/SuperAdmin)
 */
router.get(
  "/mfa/admin/status/:userId",
  auth,
  requireAdminForMFA,
  adminGetMFAStatus
);

/**
 * @desc    Admin: Get MFA statistics
 * @route   GET /api/v1/mfa/admin/statistics
 * @access  Private (Admin/SuperAdmin)
 */
router.get(
  "/mfa/admin/statistics",
  auth,
  requireAdminForMFA,
  getMFAStatistics
);

/**
 * @desc    Super Admin: Get QR code for user MFA
 * @route   GET /api/v1/mfa/admin/qr/:userId
 * @access  Private (SuperAdmin only)
 */
router.get(
  "/mfa/admin/qr/:userId",
  auth,
  requireSuperAdminForMFA, // More restrictive permissions
  adminMFALimiter,
  logMFARequest,
  adminGetQRCode
);

/**
 * @desc    Super Admin: Email backup codes to team email
 * @route   POST /api/v1/mfa/admin/email-backup-codes/:userId
 * @access  Private (SuperAdmin only)
 */
router.post(
  "/mfa/admin/email-backup-codes/:userId",
  auth,
  requireSuperAdminForMFA, // Only super admin can email backup codes
  adminMFALimiter,
  logMFARequest,
  adminEmailBackupCodes
);

// ============== HEALTH CHECK ==============

/**
 * @desc    MFA service health check
 * @route   GET /api/v1/mfa/health
 * @access  Public
 */
router.get("/mfa/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MFA service is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

module.exports = router;