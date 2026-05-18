const express = require("express");
const router = express.Router();

// Middlewares
const { authCheck, adminCheck, superAdminCheck } = require("@middlewares/auth");

// Controllers
const {
  getUserLoginHistory,
  getUserLoginStats,
  getAllLoginActivities,
  getSuspiciousActivities,
  getLoginActivityDetails,
  exportLoginActivities,
  cleanupOldActivities,
} = require("@controllers/user/loginActivityController");

// ** USER LOGIN ACTIVITY ROUTES ** //

/**
 * @route   GET /api/v1/user/login-activity/my-history
 * @desc    Get current user's login history
 * @access  Private (User)
 */
router.get("/user/login-activity/my-history", authCheck, getUserLoginHistory);

/**
 * @route   GET /api/v1/user/login-activity/my-stats
 * @desc    Get current user's login statistics
 * @access  Private (User)
 */
router.get("/user/login-activity/my-stats", authCheck, getUserLoginStats);

/**
 * @route   GET /api/v1/user/login-activity/details/:id
 * @desc    Get login activity details by ID
 * @access  Private (User can see own, Admin can see all)
 */
router.get("/user/login-activity/details/:id", authCheck, getLoginActivityDetails);

/**
 * @route   GET /api/v1/user/login-activity/export-my-data
 * @desc    Export current user's login activities
 * @access  Private (User)
 */
router.get("/user/login-activity/export-my-data", authCheck, exportLoginActivities);

// ** ADMIN LOGIN ACTIVITY ROUTES ** //

/**
 * @route   GET /api/v1/user/login-activity/all
 * @desc    Get all users' login activities (Admin/Super Admin only)
 * @access  Private (Admin/Super Admin)
 */
router.get("/user/login-activity/all", authCheck, adminCheck, getAllLoginActivities);

/**
 * @route   GET /api/v1/user/login-activity/suspicious
 * @desc    Get suspicious login activities (Admin/Super Admin only)
 * @access  Private (Admin/Super Admin)
 */
router.get("/user/login-activity/suspicious", authCheck, adminCheck, getSuspiciousActivities);

/**
 * @route   GET /api/v1/user/login-activity/export
 * @desc    Export login activities (Admin/Super Admin only)
 * @access  Private (Admin/Super Admin)
 */
router.get("/user/login-activity/export", authCheck, adminCheck, exportLoginActivities);

// ** SUPER ADMIN LOGIN ACTIVITY ROUTES ** //

/**
 * @route   DELETE /api/v1/user/login-activity/cleanup
 * @desc    Delete old login activities (Super Admin only)
 * @access  Private (Super Admin)
 */
router.delete("/user/login-activity/cleanup", authCheck, superAdminCheck, cleanupOldActivities);

module.exports = router;