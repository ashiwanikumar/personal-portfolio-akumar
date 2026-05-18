/**
 * @fileoverview Email Activity Service
 * Service layer for handling all email activity logging and statistics
 *
 * @module EmailActivityService
 * @requires mongoose
 * @requires @models/blog/emailActivity
 * @requires @utils/logger
 */

const mongoose = require("mongoose");
const logger = require("@utils/logger");

// Ensure module-alias is registered if not already
try {
  require("module-alias/register");
} catch (e) {
  // Already registered or not available
}

// Import the model
let EmailActivity;
try {
  EmailActivity = require("@models/blog/emailActivity");
} catch (error) {
  console.error("Failed to import EmailActivity model:", error);
  // Fallback to direct path
  try {
    EmailActivity = require("../../models/blog/emailActivity");
  } catch (fallbackError) {
    console.error("Fallback import also failed:", fallbackError);
    throw new Error("Cannot import EmailActivity model");
  }
}

/**
 * Custom error class for email activity operations
 */
class EmailActivityError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "EmailActivityError";
    this.status = status;
  }
}

class EmailActivityService {
  /**
   * Log email activity for blog-related actions
   * @param {Object} activityData - The email activity data
   * @returns {Promise<Object>} Created activity document
   */
  static logEmailActivity = async (activityData) => {
    try {
      const {
        blog,
        triggeredBy,
        recipients,
        activityType,
        subject,
        template,
        content,
        blogSnapshot,
        metadata = {},
      } = activityData;

      // Validate required fields
      if (!blog || !triggeredBy || !recipients || !activityType || !subject) {
        throw new EmailActivityError(
          "Missing required fields for email activity logging",
          400
        );
      }

      // Create the activity record
      const emailActivity = new EmailActivity({
        blog,
        triggeredBy,
        recipients: recipients.map((recipient) => ({
          user: recipient.user || null,
          email: recipient.email,
          name: recipient.name,
          role: recipient.role || "user",
          deliveryStatus: recipient.deliveryStatus || "sent",
          deliveredAt: recipient.deliveredAt || new Date(),
          failureReason: recipient.failureReason || null,
        })),
        activityType,
        subject,
        template: template || "default",
        content: content || "",
        blogSnapshot: {
          title: blogSnapshot?.title || "",
          author: blogSnapshot?.author || null,
          status: blogSnapshot?.status || "draft",
          approved: blogSnapshot?.approved || false,
        },
        metadata: {
          comments: metadata.comments || "",
          previousStatus: metadata.previousStatus || "",
          previousApproval: metadata.previousApproval || false,
          sendingContext: {
            userAgent: metadata.userAgent || "",
            ipAddress: metadata.ipAddress || "",
            timestamp: new Date(),
          },
        },
      });

      const savedActivity = await emailActivity.save();

      logger.info("Email activity logged successfully", {
        activityId: savedActivity._id,
        blog: blog,
        activityType,
        recipientCount: recipients.length,
      });

      return savedActivity;
    } catch (error) {
      logger.error("Error logging email activity", { error, activityData });
      throw error;
    }
  };

  /**
   * Get email statistics for a specific user
   * @param {string} userId - User ID
   * @param {Object} dateRange - Date range filter
   * @returns {Promise<Object>} User email statistics
   */
  static getUserEmailStatistics = async (userId, dateRange = {}) => {
    try {
      const stats = await EmailActivity.getUserEmailStats(userId, dateRange);

      // Transform the results into a more readable format
      const transformedStats = {
        totalActivities: stats.reduce((sum, stat) => sum + stat.count, 0),
        totalEmailsSent: stats.reduce(
          (sum, stat) => sum + stat.totalRecipients,
          0
        ),
        totalSuccessful: stats.reduce(
          (sum, stat) => sum + stat.successCount,
          0
        ),
        totalFailed: stats.reduce((sum, stat) => sum + stat.failureCount, 0),
        byActivityType: stats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalRecipients: stat.totalRecipients,
            successCount: stat.successCount,
            failureCount: stat.failureCount,
            lastActivity: stat.lastActivity,
            successRate:
              stat.totalRecipients > 0
                ? ((stat.successCount / stat.totalRecipients) * 100).toFixed(2)
                : 0,
          };
          return acc;
        }, {}),
        overallSuccessRate:
          stats.reduce((sum, stat) => sum + stat.totalRecipients, 0) > 0
            ? (
                (stats.reduce((sum, stat) => sum + stat.successCount, 0) /
                  stats.reduce((sum, stat) => sum + stat.totalRecipients, 0)) *
                100
              ).toFixed(2)
            : 0,
      };

      return transformedStats;
    } catch (error) {
      logger.error("Error getting user email statistics", { error, userId });
      throw error;
    }
  };

  /**
   * Get overall email activity statistics
   * @param {Object} dateRange - Date range filter
   * @returns {Promise<Object>} Overall email statistics
   */
  static getOverallEmailStatistics = async (dateRange = {}) => {
    try {
      const statsResult = await EmailActivity.getOverallStats(dateRange);
      const stats = statsResult[0] || {
        totalActivities: 0,
        totalRecipients: 0,
        totalSuccess: 0,
        totalFailures: 0,
        approvalEmails: 0,
        unapprovalEmails: 0,
      };

      return {
        ...stats,
        successRate:
          stats.totalRecipients > 0
            ? ((stats.totalSuccess / stats.totalRecipients) * 100).toFixed(2)
            : 0,
        failureRate:
          stats.totalRecipients > 0
            ? ((stats.totalFailures / stats.totalRecipients) * 100).toFixed(2)
            : 0,
        approvalPercentage:
          stats.totalActivities > 0
            ? ((stats.approvalEmails / stats.totalActivities) * 100).toFixed(2)
            : 0,
        unapprovalPercentage:
          stats.totalActivities > 0
            ? ((stats.unapprovalEmails / stats.totalActivities) * 100).toFixed(
                2
              )
            : 0,
      };
    } catch (error) {
      logger.error("Error getting overall email statistics", { error });
      throw error;
    }
  };

  /**
   * Get daily email activity trends
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Daily trends data
   */
  static getDailyEmailTrends = async (days = 30) => {
    try {
      const trends = await EmailActivity.getDailyTrends(days);

      // Group by date and calculate totals
      const trendsByDate = trends.reduce((acc, trend) => {
        const date = trend._id.date;
        if (!acc[date]) {
          acc[date] = {
            date,
            approval: 0,
            unapproval: 0,
            total: 0,
            recipients: 0,
          };
        }

        acc[date][trend._id.activityType] = trend.count;
        acc[date].total += trend.count;
        acc[date].recipients += trend.recipients;

        return acc;
      }, {});

      // Convert to array and sort by date
      return Object.values(trendsByDate).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    } catch (error) {
      logger.error("Error getting daily email trends", { error });
      throw error;
    }
  };

  /**
   * Get paginated email activities
   * @param {number} page - Page number
   * @param {number} perPage - Items per page
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Paginated activities
   */
  static getPaginatedEmailActivities = async (
    page = 1,
    perPage = 10,
    filters = {}
  ) => {
    try {
      const query = {};

      // Apply filters
      if (filters.userId) {
        query.triggeredBy = new mongoose.Types.ObjectId(filters.userId);
      }
      if (filters.activityType) {
        query.activityType = filters.activityType;
      }
      if (filters.blogId) {
        query.blog = new mongoose.Types.ObjectId(filters.blogId);
      }
      if (filters.dateRange?.startDate || filters.dateRange?.endDate) {
        query.createdAt = {};
        if (filters.dateRange.startDate) {
          query.createdAt.$gte = new Date(filters.dateRange.startDate);
        }
        if (filters.dateRange.endDate) {
          query.createdAt.$lte = new Date(filters.dateRange.endDate);
        }
      }

      const [activities, total] = await Promise.all([
        EmailActivity.find(query)
          .populate("blog", "title status approved")
          .populate("triggeredBy", "name email role")
          .populate("blogSnapshot.author", "name email")
          .sort({ createdAt: -1 })
          .skip((page - 1) * perPage)
          .limit(perPage),
        EmailActivity.countDocuments(query),
      ]);

      return {
        activities,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      };
    } catch (error) {
      logger.error("Error getting paginated email activities", { error });
      throw error;
    }
  };

  /**
   * Update email delivery status
   * @param {string} activityId - Activity ID
   * @param {string} recipientEmail - Recipient email
   * @param {string} status - Delivery status
   * @param {string} failureReason - Failure reason (if applicable)
   * @returns {Promise<Object>} Updated activity
   */
  static updateDeliveryStatus = async (
    activityId,
    recipientEmail,
    status,
    failureReason = null
  ) => {
    try {
      const updateQuery = {
        "recipients.$.deliveryStatus": status,
        "recipients.$.deliveredAt": new Date(),
      };

      if (failureReason) {
        updateQuery["recipients.$.failureReason"] = failureReason;
      }

      const updatedActivity = await EmailActivity.findOneAndUpdate(
        {
          _id: activityId,
          "recipients.email": recipientEmail,
        },
        {
          $set: updateQuery,
        },
        { new: true }
      );

      if (updatedActivity) {
        // Recalculate statistics
        await updatedActivity.save();
      }

      return updatedActivity;
    } catch (error) {
      logger.error("Error updating delivery status", {
        error,
        activityId,
        recipientEmail,
      });
      throw error;
    }
  };

  /**
   * Get top email recipients
   * @param {number} limit - Number of top recipients to return
   * @param {Object} dateRange - Date range filter
   * @returns {Promise<Array>} Top recipients
   */
  static getTopEmailRecipients = async (limit = 10, dateRange = {}) => {
    try {
      const matchQuery = {};

      if (dateRange.startDate || dateRange.endDate) {
        matchQuery.createdAt = {};
        if (dateRange.startDate) {
          matchQuery.createdAt.$gte = new Date(dateRange.startDate);
        }
        if (dateRange.endDate) {
          matchQuery.createdAt.$lte = new Date(dateRange.endDate);
        }
      }

      const topRecipients = await EmailActivity.aggregate([
        { $match: matchQuery },
        { $unwind: "$recipients" },
        {
          $group: {
            _id: "$recipients.email",
            name: { $first: "$recipients.name" },
            role: { $first: "$recipients.role" },
            totalEmails: { $sum: 1 },
            successfulEmails: {
              $sum: {
                $cond: [
                  { $eq: ["$recipients.deliveryStatus", "sent"] },
                  1,
                  0,
                ],
              },
            },
            failedEmails: {
              $sum: {
                $cond: [
                  { $eq: ["$recipients.deliveryStatus", "failed"] },
                  1,
                  0,
                ],
              },
            },
            lastEmail: { $max: "$createdAt" },
          },
        },
        {
          $addFields: {
            successRate: {
              $multiply: [
                { $divide: ["$successfulEmails", "$totalEmails"] },
                100,
              ],
            },
          },
        },
        { $sort: { totalEmails: -1 } },
        { $limit: limit },
      ]);

      return topRecipients;
    } catch (error) {
      logger.error("Error getting top email recipients", { error });
      throw error;
    }
  };

  /**
   * Get recent email activities with detailed information
   * @param {string} userId - User ID (optional)
   * @param {number} limit - Number of activities to return
   * @param {Object} dateRange - Date range filter
   * @returns {Promise<Array>} Recent activities with details
   */
  static getRecentActivities = async (userId = null, limit = 20, dateRange = {}) => {
    try {
      const matchQuery = {};

      // Filter by user if provided
      if (userId) {
        matchQuery.triggeredBy = new mongoose.Types.ObjectId(userId);
      }

      // Apply date range filter
      if (dateRange.startDate || dateRange.endDate) {
        matchQuery.createdAt = {};
        if (dateRange.startDate) {
          matchQuery.createdAt.$gte = new Date(dateRange.startDate);
        }
        if (dateRange.endDate) {
          matchQuery.createdAt.$lte = new Date(dateRange.endDate);
        }
      }

      const activities = await EmailActivity.find(matchQuery)
        .populate({
          path: 'blog',
          select: 'title slug status approved category author',
          populate: {
            path: 'category',
            select: 'name color'
          }
        })
        .populate({
          path: 'triggeredBy',
          select: 'name email role'
        })
        .sort({ createdAt: -1 })
        .limit(limit);

      // Transform the activities to include more readable information
      const transformedActivities = activities.map(activity => ({
        _id: activity._id,
        activityType: activity.activityType,
        subject: activity.subject,
        createdAt: activity.createdAt,
        blog: {
          id: activity.blog?._id,
          title: activity.blog?.title || activity.blogSnapshot?.title || 'Unknown Blog',
          status: activity.blog?.status || activity.blogSnapshot?.status,
          approved: activity.blog?.approved || activity.blogSnapshot?.approved,
          category: activity.blog?.category?.name || 'Uncategorized'
        },
        triggeredBy: {
          id: activity.triggeredBy?._id,
          name: activity.triggeredBy?.name || 'Unknown User',
          email: activity.triggeredBy?.email,
          role: activity.triggeredBy?.role
        },
        recipients: activity.recipients.map(recipient => ({
          email: recipient.email,
          name: recipient.name,
          role: recipient.role,
          deliveryStatus: recipient.deliveryStatus,
          deliveredAt: recipient.deliveredAt
        })),
        stats: {
          totalRecipients: activity.recipients.length,
          successfulDeliveries: activity.recipients.filter(r => r.deliveryStatus === 'sent').length,
          failedDeliveries: activity.recipients.filter(r => r.deliveryStatus === 'failed').length
        },
        comments: activity.metadata?.comments || '',
        actionDescription: this.getActionDescription(activity)
      }));

      return transformedActivities;
    } catch (error) {
      logger.error("Error getting recent activities", { error, userId });
      throw error;
    }
  };

  /**
   * Get human-readable description of the email activity
   * @param {Object} activity - Email activity document
   * @returns {string} Action description
   */
  static getActionDescription = (activity) => {
    const blogTitle = activity.blog?.title || activity.blogSnapshot?.title || 'Unknown Blog';
    const userName = activity.triggeredBy?.name || 'Unknown User';

    switch (activity.activityType) {
      case 'approval':
        return `${userName} approved the blog "${blogTitle}"`;
      case 'unapproval':
        return `${userName} unapproved the blog "${blogTitle}"`;
      case 'blog_created':
        return `${userName} created a new blog "${blogTitle}"`;
      case 'blog_updated':
        return `${userName} updated the blog "${blogTitle}"`;
      default:
        return `${userName} performed ${activity.activityType} action on "${blogTitle}"`;
    }
  };

  /**
   * Delete old email activities (cleanup)
   * @param {number} daysOld - Days old to delete
   * @returns {Promise<number>} Number of deleted records
   */
  static cleanupOldActivities = async (daysOld = 90) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await EmailActivity.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      logger.info("Cleaned up old email activities", {
        deletedCount: result.deletedCount,
        cutoffDate,
      });

      return result.deletedCount;
    } catch (error) {
      logger.error("Error cleaning up old activities", { error });
      throw error;
    }
  };
}

module.exports = EmailActivityService;