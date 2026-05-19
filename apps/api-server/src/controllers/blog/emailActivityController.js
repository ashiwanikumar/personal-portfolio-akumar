/**
 * @fileoverview Email Activity Controller
 * Controller for handling email activity analytics and statistics
 *
 * @module EmailActivityController
 */

const EmailActivityService = require("@services/blog/emailActivityService");
const logger = require("@utils/logger");

/**
 * Get email statistics for the authenticated user
 * @route GET /api/blog/email-activity/my-stats
 */
exports.getMyEmailStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    const stats = await EmailActivityService.getUserEmailStatistics(userId, dateRange);

    res.status(200).json({
      message: "User email statistics retrieved successfully",
      data: stats,
      userId: userId,
      dateRange,
    });
  } catch (error) {
    logger.error("GET_MY_EMAIL_STATISTICS_ERROR", error);
    res.status(500).json({
      message: "Error retrieving email statistics",
      status: "error",
      error: error.message,
    });
  }
};

/**
 * Get overall email statistics (admin only)
 * @route GET /api/blog/email-activity/overall-stats
 */
exports.getOverallEmailStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    const stats = await EmailActivityService.getOverallEmailStatistics(dateRange);

    res.status(200).json({
      message: "Overall email statistics retrieved successfully",
      data: stats,
      dateRange,
    });
  } catch (error) {
    logger.error("GET_OVERALL_EMAIL_STATISTICS_ERROR", error);
    res.status(500).json({
      message: "Error retrieving overall email statistics",
      status: "error",
      error: error.message,
    });
  }
};

/**
 * Get daily email activity trends
 * @route GET /api/blog/email-activity/daily-trends
 */
exports.getDailyEmailTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const trends = await EmailActivityService.getDailyEmailTrends(parseInt(days));

    res.status(200).json({
      message: "Daily email trends retrieved successfully",
      data: trends,
      days: parseInt(days),
    });
  } catch (error) {
    logger.error("GET_DAILY_EMAIL_TRENDS_ERROR", error);
    res.status(500).json({
      message: "Error retrieving daily email trends",
      status: "error",
      error: error.message,
    });
  }
};

/**
 * Get paginated email activities
 * @route GET /api/blog/email-activity/activities
 */
exports.getEmailActivities = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      userId,
      activityType,
      blogId,
      startDate,
      endDate,
    } = req.query;

    const filters = {};
    if (userId) filters.userId = userId;
    if (activityType) filters.activityType = activityType;
    if (blogId) filters.blogId = blogId;
    if (startDate || endDate) {
      filters.dateRange = {};
      if (startDate) filters.dateRange.startDate = startDate;
      if (endDate) filters.dateRange.endDate = endDate;
    }

    const result = await EmailActivityService.getPaginatedEmailActivities(
      parseInt(page),
      parseInt(perPage),
      filters
    );

    res.status(200).json({
      message: "Email activities retrieved successfully",
      ...result,
      filters,
    });
  } catch (error) {
    logger.error("GET_EMAIL_ACTIVITIES_ERROR", error);
    res.status(500).json({
      message: "Error retrieving email activities",
      status: "error",
      error: error.message,
    });
  }
};

/**
 * Get email statistics for a specific user (admin only)
 * @route GET /api/blog/email-activity/user-stats/:userId
 */
exports.getUserEmailStatistics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    const stats = await EmailActivityService.getUserEmailStatistics(userId, dateRange);

    res.status(200).json({
      message: "User email statistics retrieved successfully",
      data: stats,
      userId: userId,
      dateRange,
    });
  } catch (error) {
    logger.error("GET_USER_EMAIL_STATISTICS_ERROR", error);
    res.status(500).json({
      message: "Error retrieving user email statistics",
      status: "error",
      error: error.message,
    });
  }
};

/**
 * Get top email recipients (admin only)
 * @route GET /api/blog/email-activity/top-recipients
 */
exports.getTopEmailRecipients = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    const topRecipients = await EmailActivityService.getTopEmailRecipients(
      parseInt(limit),
      dateRange
    );

    res.status(200).json({
      message: "Top email recipients retrieved successfully",
      data: topRecipients,
      limit: parseInt(limit),
      dateRange,
    });
  } catch (error) {
    logger.error("GET_TOP_EMAIL_RECIPIENTS_ERROR", error);
    res.status(500).json({
      message: "Error retrieving top email recipients",
      status: "error",
      error: error.message,
    });
  }
};

/**
 * Update email delivery status (webhook endpoint)
 * @route POST /api/blog/email-activity/update-delivery-status
 */
exports.updateEmailDeliveryStatus = async (req, res) => {
  try {
    const { activityId, recipientEmail, status, failureReason } = req.body;

    if (!activityId || !recipientEmail || !status) {
      return res.status(400).json({
        message: "Activity ID, recipient email, and status are required",
        status: "error",
      });
    }

    const updatedActivity = await EmailActivityService.updateDeliveryStatus(
      activityId,
      recipientEmail,
      status,
      failureReason
    );

    if (!updatedActivity) {
      return res.status(404).json({
        message: "Email activity or recipient not found",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Email delivery status updated successfully",
      data: updatedActivity,
    });
  } catch (error) {
    logger.error("UPDATE_EMAIL_DELIVERY_STATUS_ERROR", error);
    res.status(500).json({
      message: "Error updating email delivery status",
      status: "error",
      error: error.message,
    });
  }
};

/**
 * Get recent email activities with detailed information
 * @route GET /api/blog/email-activity/recent
 */
exports.getRecentEmailActivities = async (req, res) => {
  try {
    const { limit = 20, startDate, endDate } = req.query;
    const userId = req.user._id;
    const isAdmin = req.user.role === "super_admin" || req.user.role === "admin";

    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    // For non-admin users, only show their own activities
    const filterUserId = isAdmin ? null : userId;

    const activities = await EmailActivityService.getRecentActivities(
      filterUserId,
      parseInt(limit),
      dateRange
    );

    res.status(200).json({
      message: "Recent email activities retrieved successfully",
      data: activities,
      limit: parseInt(limit),
      isAdmin,
      dateRange,
    });
  } catch (error) {
    logger.error("GET_RECENT_EMAIL_ACTIVITIES_ERROR", error);
    res.status(500).json({
      message: "Error retrieving recent email activities",
      status: "error",
      error: error.message,
    });
  }
};

/**
 * Get email activity analytics dashboard data
 * @route GET /api/blog/email-activity/dashboard
 */
exports.getEmailActivityDashboard = async (req, res) => {
  try {
    const { startDate, endDate, days = 30 } = req.query;
    const userId = req.user._id;
    const isAdmin = req.user.role === "super_admin" || req.user.role === "admin";

    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    // Get user-specific stats
    const userStats = await EmailActivityService.getUserEmailStatistics(userId, dateRange);

    // Get overall stats if user is admin
    let overallStats = null;
    if (isAdmin) {
      overallStats = await EmailActivityService.getOverallEmailStatistics(dateRange);
    }

    // Get trends data
    const trends = await EmailActivityService.getDailyEmailTrends(parseInt(days));

    // Get top recipients if admin
    let topRecipients = null;
    if (isAdmin) {
      topRecipients = await EmailActivityService.getTopEmailRecipients(10, dateRange);
    }

    // Get recent activities for the dashboard
    const filterUserId = isAdmin ? null : userId;
    const recentActivities = await EmailActivityService.getRecentActivities(
      filterUserId,
      10,
      dateRange
    );

    res.status(200).json({
      message: "Email activity dashboard data retrieved successfully",
      data: {
        userStats,
        overallStats,
        trends,
        topRecipients,
        recentActivities,
      },
      dateRange,
      days: parseInt(days),
      isAdmin,
    });
  } catch (error) {
    logger.error("GET_EMAIL_ACTIVITY_DASHBOARD_ERROR", error);
    res.status(500).json({
      message: "Error retrieving email activity dashboard data",
      status: "error",
      error: error.message,
    });
  }
};

/**
 * Clean up old email activities (admin only)
 * @route DELETE /api/blog/email-activity/cleanup
 */
exports.cleanupOldEmailActivities = async (req, res) => {
  try {
    const { daysOld = 90 } = req.body;

    const deletedCount = await EmailActivityService.cleanupOldActivities(parseInt(daysOld));

    res.status(200).json({
      message: "Old email activities cleaned up successfully",
      deletedCount,
      daysOld: parseInt(daysOld),
    });
  } catch (error) {
    logger.error("CLEANUP_OLD_EMAIL_ACTIVITIES_ERROR", error);
    res.status(500).json({
      message: "Error cleaning up old email activities",
      status: "error",
      error: error.message,
    });
  }
};

/**
 * Export email activities data (admin only)
 * @route GET /api/blog/email-activity/export
 */
exports.exportEmailActivities = async (req, res) => {
  try {
    const {
      format = 'json',
      userId,
      activityType,
      blogId,
      startDate,
      endDate,
    } = req.query;

    const filters = {};
    if (userId) filters.userId = userId;
    if (activityType) filters.activityType = activityType;
    if (blogId) filters.blogId = blogId;
    if (startDate || endDate) {
      filters.dateRange = {};
      if (startDate) filters.dateRange.startDate = startDate;
      if (endDate) filters.dateRange.endDate = endDate;
    }

    // Get all activities for export (no pagination)
    const result = await EmailActivityService.getPaginatedEmailActivities(
      1,
      10000, // Large number to get all records
      filters
    );

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Date',
        'Blog Title',
        'Activity Type',
        'Triggered By',
        'Recipients Count',
        'Success Count',
        'Failure Count',
        'Status'
      ];

      const csvRows = result.activities.map(activity => [
        activity.createdAt.toISOString(),
        activity.blogSnapshot.title || 'N/A',
        activity.activityType,
        activity.triggeredBy?.email || 'System',
        activity.statistics.totalRecipients,
        activity.statistics.successCount,
        activity.statistics.failureCount,
        activity.status
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="email-activities.csv"');
      res.send(csvContent);
    } else {
      // JSON format
      res.status(200).json({
        message: "Email activities exported successfully",
        data: result.activities,
        totalCount: result.pagination.total,
        filters,
        exportedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error("EXPORT_EMAIL_ACTIVITIES_ERROR", error);
    res.status(500).json({
      message: "Error exporting email activities",
      status: "error",
      error: error.message,
    });
  }
};