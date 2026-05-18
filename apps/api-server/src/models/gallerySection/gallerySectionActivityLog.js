const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
      enum: [
        "superadmin",
        "admin",
        "moderator",
        "user",
        "member",
        "marketingadmin",
      ],
    },

    // Activity Information
    activityType: {
      type: String,
      required: true,
      enum: [
        "download_logs",
        "upload_media",
        "approve_media",
        "disapprove_media",
        "feature_media",
        "unfeature_media",
        "archive_media",
        "restore_media",
        "delete_media",
        "edit_media",
        "create_category",
        "edit_category",
        "delete_category",
        "create_tag",
        "edit_tag",
        "delete_tag",
        "toggle_tag_status",
        "bulk_create_tags",
        "bulk_edit_tags",
        "bulk_delete_tags",
        "bulk_delete_media",
        "create_media",
        "category_action",
        "tag_action",
        "track_activity",
      ],
    },
    action: {
      type: String,
      required: true,
    },

    // Target Information (what was acted upon)
    targetType: {
      type: String,
      enum: ["media", "category", "tag", "archive", "analytics", "system"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    targetName: String,

    // Media specific fields
    mediaType: {
      type: String,
      enum: ["image", "video", "all"],
    },

    // Additional Details
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Technical Information
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    url: String,

    // Request Information
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },

    // Status and Results
    status: {
      type: String,
      enum: ["success", "failed", "error"],
      default: "success",
    },
    errorMessage: String,

    // Location Information
    state: {
      code: String,
      name: String,
    },

    // Timestamps
    timestamp: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "gallery_activity_logs",
  }
);

// Indexes for better query performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ activityType: 1, createdAt: -1 });
activityLogSchema.index({ userRole: 1, createdAt: -1 });
activityLogSchema.index({ mediaType: 1, createdAt: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ timestamp: -1 });

// Compound indexes for common queries
activityLogSchema.index({ userId: 1, activityType: 1, createdAt: -1 });
activityLogSchema.index({ userRole: 1, activityType: 1, createdAt: -1 });

// TTL index to auto-delete logs older than 1 year (optional)
activityLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 }
);

// Virtual for formatted timestamp
activityLogSchema.virtual("formattedTimestamp").get(function () {
  return this.timestamp ? this.timestamp.toLocaleString() : null;
});

// Virtual for activity display name
activityLogSchema.virtual("activityDisplayName").get(function () {
  return this.activityType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
});

// Static method to create activity log
activityLogSchema.statics.createLog = async function (logData) {
  try {
    const log = new this(logData);
    return await log.save();
  } catch (error) {
    console.error("Error creating activity log:", error);
    throw error;
  }
};

// Static method to get activity statistics
activityLogSchema.statics.getStatistics = async function (filters = {}) {
  const matchStage = {};

  if (filters.startDate || filters.endDate) {
    matchStage.createdAt = {};
    if (filters.startDate)
      matchStage.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
  }

  if (filters.userId)
    matchStage.userId = new mongoose.Types.ObjectId(filters.userId);
  if (filters.activityType) matchStage.activityType = filters.activityType;
  if (filters.userRole) matchStage.userRole = filters.userRole;

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
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
  ];

  return await this.aggregate(pipeline);
};

// Static method to get top active users
activityLogSchema.statics.getTopActiveUsers = async function (filters = {}) {
  const matchStage = {};

  if (filters.startDate || filters.endDate) {
    matchStage.createdAt = {};
    if (filters.startDate)
      matchStage.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) matchStage.createdAt.$lte = new Date(filters.endDate);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: "$userId",
        userName: { $first: "$userName" },
        userRole: { $first: "$userRole" },
        totalActivities: { $sum: 1 },
        lastActivity: { $max: "$createdAt" },
        activityTypes: { $addToSet: "$activityType" },
      },
    },
    { $sort: { totalActivities: -1 } },
    { $limit: filters.limit || 10 },
  ];

  return await this.aggregate(pipeline);
};

module.exports = mongoose.model("ActivityLog", activityLogSchema);
