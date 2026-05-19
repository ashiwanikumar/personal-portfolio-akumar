const express = require("express");
const router = express.Router();

// ** CONTROLLERS ** //
const {
  getBlogActivityAnalytics,
  getRecentBlogActivities,
  getBlogActivityTimeline,
  getUserActivityStats,
  getActivityTypes,
  exportBlogActivities,
  getActivitySummary,
  getActivityFilterOptions,
} = require("@controllers/blog/blogAnalyticsController");

const {
  generateAndSendEmailReport,
  getReportHistory,
  getReportStatus,
} = require("@controllers/blog/blogReportController");

// ** MIDDLEWARES ** //
const { authCheck, authCheckWithRole, superOrMarketingAdminCheck } = require("@middlewares/auth");

// ** ROUTES ** //

/**
 * @route   GET /api/v1/blog/analytics/summary
 * @desc    Get activity summary for dashboard
 * @access  Private (Admin/Super Admin)
 */
router.get(
  "/summary",
  authCheck,
  superOrMarketingAdminCheck,
  getActivitySummary
);

/**
 * @route   GET /api/v1/blog/analytics/dashboard
 * @desc    Get comprehensive blog activity analytics
 * @access  Private (Admin/Super Admin)
 */
router.get(
  "/dashboard",
  authCheck,
  superOrMarketingAdminCheck,
  getBlogActivityAnalytics
);

/**
 * @route   GET /api/v1/blog/analytics/activities/recent
 * @desc    Get recent blog activities
 * @access  Private (Admin/Super Admin)
 */
router.get(
  "/activities/recent",
  authCheck,
  superOrMarketingAdminCheck,
  getRecentBlogActivities
);

/**
 * @route   GET /api/v1/blog/analytics/activities/export
 * @desc    Export blog activities to CSV/Excel
 * @access  Private (Admin/Super Admin)
 */
router.get(
  "/activities/export",
  authCheck,
  superOrMarketingAdminCheck,
  exportBlogActivities
);

/**
 * @route   GET /api/v1/blog/analytics/activity-types
 * @desc    Get available activity types and their descriptions
 * @access  Private (Admin/Super Admin)
 */
router.get(
  "/activity-types",
  authCheck,
  superOrMarketingAdminCheck,
  getActivityTypes
);

/**
 * @route   GET /api/v1/blog/analytics/filter-options
 * @desc    Get filter options for activity logs (users, activity types, etc.)
 * @access  Private (Admin/Super Admin)
 */
router.get(
  "/filter-options",
  authCheck,
  superOrMarketingAdminCheck,
  getActivityFilterOptions
);

/**
 * @route   GET /api/v1/blog/analytics/blog/:blogId/timeline
 * @desc    Get activity timeline for a specific blog
 * @access  Private (Admin/Super Admin/Author)
 */
router.get(
  "/blog/:blogId/timeline",
  authCheck,
  superOrMarketingAdminCheck,
  getBlogActivityTimeline
);

/**
 * @route   GET /api/v1/blog/analytics/user/:userId/stats
 * @desc    Get activity statistics for a specific user
 * @access  Private (Admin/Super Admin)
 */
router.get(
  "/user/:userId/stats",
  authCheck,
  superOrMarketingAdminCheck,
  getUserActivityStats
);

// ** EMAIL REPORT ROUTES ** //

/**
 * @route   POST /api/v1/blog/analytics/reports/email
 * @desc    Generate and send blog activity report via email
 * @access  Private (Authenticated users - only their own data)
 */
router.post(
  "/reports/email",
  authCheckWithRole,
  generateAndSendEmailReport
);

/**
 * @route   GET /api/v1/blog/analytics/reports/history
 * @desc    Get report generation history for current user
 * @access  Private (Authenticated users - only their own data)
 */
router.get(
  "/reports/history",
  authCheckWithRole,
  getReportHistory
);

/**
 * @route   GET /api/v1/blog/analytics/reports/:reportId/status
 * @desc    Get report status by report ID
 * @access  Private (Authenticated users - only their own reports)
 */
router.get(
  "/reports/:reportId/status",
  authCheckWithRole,
  getReportStatus
);

module.exports = router;
