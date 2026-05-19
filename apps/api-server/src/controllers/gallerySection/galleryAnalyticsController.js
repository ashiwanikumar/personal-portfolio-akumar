const GallerySectionService = require("../../services/gallerySection/gallerySectionService");
const ActivityLog = require("../../models/gallerySection/gallerySectionActivityLog");
const User = require("../../models/user/user");
const mongoose = require("mongoose");
const {
  seedActivityLogs,
} = require("../../utils/seedGallerySectionActivityLogs");
const { clearActivityLogs } = require("../../utils/clearActivityLogs");

/**
 * Get comprehensive gallery analytics
 */
exports.getGalleryAnalytics = async (req, res) => {
  try {
    const analytics = await GallerySectionService.getGalleryAnalytics();

    res.status(200).json({
      success: true,
      analytics,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET_GALLERY_ANALYTICS_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching gallery analytics",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get media type analytics (photos vs videos)
 */
exports.getMediaTypeAnalytics = async (req, res) => {
  try {
    const { includeArchived = false } = req.query;

    const analytics = await GallerySectionService.getMediaTypeAnalytics({
      includeArchived: includeArchived === "true",
    });

    res.status(200).json({
      success: true,
      analytics,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET_MEDIA_TYPE_ANALYTICS_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching media type analytics",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get approval status analytics
 */
exports.getApprovalAnalytics = async (req, res) => {
  try {
    const { includeArchived = false } = req.query;

    const analytics = await GallerySectionService.getApprovalAnalytics({
      includeArchived: includeArchived === "true",
    });

    res.status(200).json({
      success: true,
      analytics,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET_APPROVAL_ANALYTICS_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching approval analytics",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

// ================== ACTIVITY LOGS ENDPOINTS ================== //

/**
 * Get activity logs with pagination and filtering
 */
exports.getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      startDate,
      endDate,
      userId,
      action,
      activityType,
      targetType,
      userRole,
      mediaType,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter conditions
    const filters = {};

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filters.userId = new mongoose.Types.ObjectId(userId);
    }

    if (action) filters.activityType = action;
    if (activityType) filters.activityType = activityType;
    if (targetType) filters.targetType = targetType;
    if (userRole) filters.userRole = userRole;
    if (mediaType && mediaType !== "all") filters.mediaType = mediaType;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(perPage);
    const limit = parseInt(perPage);

    // Get logs with pagination
    const [logs, totalCount] = await Promise.all([
      ActivityLog.find(filters)
        .populate("userId", "name email role")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(filters),
    ]);

    // Calculate pagination data
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET_ACTIVITY_LOGS_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity logs",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get user activity summary
 */
exports.getUserActivitySummary = async (req, res) => {
  try {
    const { userId } = req.query;

    const filters = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filters.userId = new mongoose.Types.ObjectId(userId);
    }

    const summary = await ActivityLog.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          lastActivity: { $max: "$createdAt" },
          activitiesByType: {
            $push: {
              type: "$activityType",
              timestamp: "$createdAt",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalActivities: 1,
          lastActivity: 1,
          activitiesByType: {
            $reduce: {
              input: "$activitiesByType",
              initialValue: {},
              in: {
                $mergeObjects: [
                  "$$value",
                  {
                    $arrayToObject: [
                      [
                        {
                          k: "$$this.type",
                          v: {
                            $add: [
                              {
                                $ifNull: [
                                  {
                                    $getField: {
                                      field: "$$this.type",
                                      input: "$$value",
                                    },
                                  },
                                  0,
                                ],
                              },
                              1,
                            ],
                          },
                        },
                      ],
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    const result =
      summary.length > 0
        ? summary[0]
        : {
            totalActivities: 0,
            lastActivity: null,
            activitiesByType: {},
          };

    res.status(200).json({
      success: true,
      data: result,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET_USER_ACTIVITY_SUMMARY_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user activity summary",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get activity statistics
 */
exports.getActivityStatistics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    const filters = {};
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    let dateFormat;
    switch (groupBy) {
      case "week":
        dateFormat = "%Y-W%U";
        break;
      case "month":
        dateFormat = "%Y-%m";
        break;
      default:
        dateFormat = "%Y-%m-%d";
    }

    const statistics = await ActivityLog.aggregate([
      { $match: filters },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
            activityType: "$activityType",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          activities: {
            $push: {
              type: "$_id.activityType",
              count: "$count",
            },
          },
          totalCount: { $sum: "$count" },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: statistics,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET_ACTIVITY_STATISTICS_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity statistics",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Download activity logs as CSV/Excel
 */
exports.downloadActivityLogs = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      userId,
      action,
      mediaType,
      format = "csv",
    } = req.query;

    // Build filter conditions
    const filters = {};

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filters.userId = new mongoose.Types.ObjectId(userId);
    }

    if (action) filters.activityType = action;
    if (activityType) filters.activityType = activityType;
    if (targetType) filters.targetType = targetType;
    if (userRole) filters.userRole = userRole;
    if (mediaType && mediaType !== "all") filters.mediaType = mediaType;

    // Get logs
    const logs = await ActivityLog.find(filters)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    // Convert to CSV format
    if (format === "csv") {
      const csvHeader =
        "Date,Time,User Name,User Role,Activity Type,Action,Target Type,Target Name,Media Type,IP Address,Status\n";

      const csvData = logs
        .map((log) => {
          const date = new Date(log.createdAt);
          return [
            date.toDateString(),
            date.toTimeString(),
            log.userName || "Unknown",
            log.userRole || "Unknown",
            log.activityType || "",
            log.action || "",
            log.targetType || "",
            log.targetName || "",
            log.mediaType || "",
            log.ipAddress || "",
            log.status || "success",
          ]
            .map((field) => `"${String(field).replace(/"/g, '""')}"`)
            .join(",");
        })
        .join("\n");

      const csvContent = csvHeader + csvData;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="activity-logs-${
          new Date().toISOString().split("T")[0]
        }.csv"`
      );
      res.send(csvContent);
    } else {
      // Return JSON for Excel processing on client side
      res.status(200).json({
        success: true,
        data: logs,
        format: "excel",
        filename: `activity-logs-${
          new Date().toISOString().split("T")[0]
        }.xlsx`,
        status: "success",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("DOWNLOAD_ACTIVITY_LOGS_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading activity logs",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get recent activity for dashboard widget
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentActivity = await ActivityLog.find({})
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: recentActivity,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET_RECENT_ACTIVITY_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent activity",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get top users by activity
 */
exports.getTopActiveUsers = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    const filters = {};
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    const topUsers = await ActivityLog.getTopActiveUsers({
      ...filters,
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: topUsers,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET_TOP_ACTIVE_USERS_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top active users",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track user activity (for client-side activity tracking)
 */
exports.trackActivity = async (req, res) => {
  try {
    const {
      activityType,
      action,
      targetType,
      targetId,
      targetName,
      mediaType,
      details = {},
    } = req.body;

    // Get user info from request (added by auth middleware)
    const tokenUser = req.user;
    if (!tokenUser) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        status: "error",
        timestamp: new Date().toISOString(),
      });
    }

    // Get user ID - handle both _id and id fields
    const userId = tokenUser._id || tokenUser.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found",
        status: "error",
        timestamp: new Date().toISOString(),
      });
    }

    let userName, userRole;

    // If user data is minimal (only ID), fetch full user data from database
    if (!tokenUser.name && !tokenUser.email && !tokenUser.role) {
      try {
        const fullUser = await User.findById(userId)
          .populate("roleInfo")
          .lean();
        if (fullUser) {
          userName =
            fullUser.name ||
            fullUser.email ||
            fullUser.username ||
            `User_${userId}`;
          // Check both legacy role field and new role system
          let roleFromDb =
            fullUser.role ||
            (fullUser.roleInfo && fullUser.roleInfo.name) ||
            "user";

          // Map role names to standardized values for activity logs
          const roleMap = {
            "Super Admin": "superadmin",
            Admin: "admin",
            "Content Manager": "admin",
            "Marketing Admin": "marketingadmin",
            Moderator: "moderator",
            User: "user",
            Member: "member",
          };

          userRole = roleMap[roleFromDb] || roleFromDb.toLowerCase() || "user";
        } else {
          userName = `User_${userId}`;
          userRole = "user";
        }
      } catch (dbError) {
        console.error("TrackActivity: Error fetching user data", dbError);
        userName = `User_${userId}`;
        userRole = "user";
      }
    } else {
      // Use data from token
      userName =
        tokenUser.name ||
        tokenUser.email ||
        tokenUser.username ||
        `User_${userId}`;
      userRole = tokenUser.role || "user";
    }

    // Validate userRole against enum values
    const validRoles = [
      "superadmin",
      "admin",
      "moderator",
      "user",
      "member",
      "marketingadmin",
    ];
    const normalizedRole = validRoles.includes(userRole) ? userRole : "user";

    // Get client info
    const ipAddress =
      req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"];
    const userAgent = req.headers["user-agent"];

    // Create activity log
    const activityLog = await ActivityLog.createLog({
      userId: userId,
      userName: userName,
      userRole: normalizedRole,
      activityType,
      action: action || activityType,
      targetType,
      targetId: targetId ? new mongoose.Types.ObjectId(targetId) : undefined,
      targetName,
      mediaType,
      details,
      ipAddress,
      userAgent,
      method: req.method,
      url: req.originalUrl,
      status: "success",
    });

    res.status(201).json({
      success: true,
      data: activityLog,
      message: "Activity tracked successfully",
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("TRACK_ACTIVITY_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking activity",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Seed sample activity logs (for testing/demo purposes)
 */
exports.seedSampleLogs = async (req, res) => {
  try {
    // Only allow super admins to seed data
    const user = req.user;
    if (!user || user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only super admins can seed sample data",
        status: "error",
        timestamp: new Date().toISOString(),
      });
    }

    const result = await seedActivityLogs();

    res.status(201).json({
      success: true,
      data: result,
      message: `Successfully seeded ${result.length} sample activity logs`,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("SEED_SAMPLE_LOGS_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error seeding sample logs",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Clear all activity logs (for testing/development purposes)
 */
exports.clearActivityLogs = async (req, res) => {
  try {
    // Only allow super admins to clear data
    const user = req.user;
    if (!user || user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only super admins can clear activity logs",
        status: "error",
        timestamp: new Date().toISOString(),
      });
    }

    const result = await clearActivityLogs();

    res.status(200).json({
      success: true,
      data: result,
      message: `Successfully cleared ${result.deletedCount} activity logs`,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("CLEAR_ACTIVITY_LOGS_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing activity logs",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString(),
    });
  }
};
