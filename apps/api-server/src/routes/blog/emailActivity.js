// ** LIBS ** //
const express = require("express");
const router = express.Router();

// ** MIDDLEWARES ** //
const { authCheck, superOrMarketingAdminCheck } = require("@middlewares/auth");

// ** CONTROLLERS ** //
const {
  getMyEmailStatistics,
  getOverallEmailStatistics,
  getDailyEmailTrends,
  getEmailActivities,
  getUserEmailStatistics,
  getTopEmailRecipients,
  updateEmailDeliveryStatus,
  getEmailActivityDashboard,
  getRecentEmailActivities,
  cleanupOldEmailActivities,
  exportEmailActivities,
} = require("@controllers/blog/emailActivityController");

// ** USER ROUTES ** //
// Get current user's email statistics
router.get("/email-activity/my-stats", authCheck, getMyEmailStatistics);

// Get email activity dashboard data for current user
router.get("/email-activity/dashboard", authCheck, getEmailActivityDashboard);

// Get recent email activities with detailed information
router.get("/email-activity/recent", authCheck, getRecentEmailActivities);

// ** ADMIN ROUTES ** //
// Get overall email statistics (admin only)
router.get(
  "/email-activity/overall-stats",
  authCheck,
  superOrMarketingAdminCheck,
  getOverallEmailStatistics
);

// Get daily email trends (admin only)
router.get(
  "/email-activity/daily-trends",
  authCheck,
  superOrMarketingAdminCheck,
  getDailyEmailTrends
);

// Get paginated email activities (admin only)
router.get(
  "/email-activity/activities",
  authCheck,
  superOrMarketingAdminCheck,
  getEmailActivities
);

// Get email statistics for a specific user (admin only)
router.get(
  "/email-activity/user-stats/:userId",
  authCheck,
  superOrMarketingAdminCheck,
  getUserEmailStatistics
);

// Get top email recipients (admin only)
router.get(
  "/email-activity/top-recipients",
  authCheck,
  superOrMarketingAdminCheck,
  getTopEmailRecipients
);

// Export email activities data (admin only)
router.get(
  "/email-activity/export",
  authCheck,
  superOrMarketingAdminCheck,
  exportEmailActivities
);

// Clean up old email activities (admin only)
router.delete(
  "/email-activity/cleanup",
  authCheck,
  superOrMarketingAdminCheck,
  cleanupOldEmailActivities
);

// ** WEBHOOK ROUTES ** //
// Update email delivery status (webhook endpoint - no auth required)
router.post(
  "/email-activity/update-delivery-status",
  updateEmailDeliveryStatus
);

module.exports = router;
