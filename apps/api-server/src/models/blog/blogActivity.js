// ** LIBS ** //
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const blogActivitySchema = new mongoose.Schema(
  {
    // Blog reference (optional for category/tag activities)
    blog: {
      type: ObjectId,
      ref: "Blog",
      index: true,
    },
    
    // Blog Category reference (for category-related activities)
    blogCategory: {
      type: ObjectId,
      ref: "BlogCategory",
      index: true,
    },
    
    // Blog Tag reference (for tag-related activities)
    blogTag: {
      type: ObjectId,
      ref: "BlogTag",
      index: true,
    },
    
    // User who performed the action
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    // Activity type
    activityType: {
      type: String,
      enum: [
        // Blog activities
        "blog_created",
        "blog_updated", 
        "blog_deleted",
        "blog_approved",
        "blog_rejected",
        "blog_published",
        "blog_unpublished",
        "blog_scheduled",
        "blog_unscheduled",
        "blog_draft_saved",
        "blog_submitted_for_approval",
        "blog_cover_image_uploaded",
        "blog_cover_image_updated",
        "blog_cover_image_deleted",
        "blog_content_image_uploaded",
        "blog_media_uploaded",
        "blog_media_deleted",
        
        // Category activities
        "category_created",
        "category_updated",
        "category_deleted",
        "category_blog_assigned",
        "category_blog_removed",
        
        // Tag activities
        "tag_created",
        "tag_updated", 
        "tag_deleted",
        "tag_blog_assigned",
        "tag_blog_removed",
        
        // Permission activities
        "blog_permission_granted",
        "blog_permission_revoked",
        "blog_access_attempted",
        "blog_access_denied",
        
        // Email activities
        "email_approval_sent",
        "email_rejection_sent",
        "email_publication_sent",
        "email_schedule_sent",
        
        // System activities
        "blog_auto_published",
        "blog_auto_unpublished",
        "blog_expired",
        "blog_archived",
        "blog_restored",
        
        // Report activities
        "blog_report_generated"
      ],
      required: true,
      index: true,
    },
    
    // Action description
    action: {
      type: String,
      required: true,
    },
    
    // Detailed description of what changed
    description: {
      type: String,
    },
    
    // Data snapshot before the change
    beforeData: {
      type: mongoose.Schema.Types.Mixed,
    },
    
    // Data snapshot after the change
    afterData: {
      type: mongoose.Schema.Types.Mixed,
    },
    
    // Changes made (for update activities)
    changes: {
      type: mongoose.Schema.Types.Mixed,
    },
    
    // Target user (for permission activities or when action affects another user)
    targetUser: {
      type: ObjectId,
      ref: "User",
      index: true,
    },
    
    // Activity metadata
    metadata: {
      // IP address of the user
      ipAddress: String,
      
      // User agent string
      userAgent: String,
      
      // Source of the activity (web, api, mobile, etc.)
      source: {
        type: String,
        enum: ["web", "api", "mobile", "system", "cron", "email_migration"],
        default: "web",
      },
      
      // Session information
      sessionId: String,
      
      // API endpoint that triggered the activity
      endpoint: String,
      
      // HTTP method used
      method: {
        type: String,
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      },
      
      // Request ID for tracing
      requestId: String,
      
      // Additional context data
      context: mongoose.Schema.Types.Mixed,
      
      // File information (for upload activities)
      fileInfo: {
        originalName: String,
        size: Number,
        mimeType: String,
        s3Key: String,
        cloudFrontUrl: String,
      },
      
      // Scheduling information
      schedulingInfo: {
        scheduledAt: Date,
        publishAt: Date,
        unpublishAt: Date,
        scheduleType: String,
        recurringPattern: String,
      },
      
      // Email information
      emailInfo: {
        recipients: [String],
        subject: String,
        template: String,
        deliveryStatus: String,
        messageId: String,
      },
      
      // Performance metrics
      performance: {
        duration: Number, // in milliseconds
        queryCount: Number,
        memoryUsage: Number,
      },
    },
    
    // Activity status
    status: {
      type: String,
      enum: ["success", "failed", "pending", "partial"],
      default: "success",
      index: true,
    },
    
    // Error information (if activity failed)
    error: {
      message: String,
      code: String,
      stack: String,
    },
    
    // Tags for categorizing activities
    tags: [String],
    
    // Priority level
    priority: {
      type: String,
      enum: ["low", "normal", "high", "critical"],
      default: "normal",
      index: true,
    },
    
    // Visibility level
    visibility: {
      type: String,
      enum: ["public", "internal", "admin_only", "system"],
      default: "internal",
      index: true,
    },
    
    // Related activities (for linking related actions)
    relatedActivities: [{
      type: ObjectId,
      ref: "BlogActivity",
    }],
    
    // Parent activity (for nested activities)
    parentActivity: {
      type: ObjectId,
      ref: "BlogActivity",
      index: true,
    },
    
    // Activity expiry (for cleanup purposes)
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // TTL index
    },
  },
  {
    timestamps: true,
    // Indexes for efficient querying
    index: [
      { blog: 1, createdAt: -1 },
      { user: 1, createdAt: -1 },
      { activityType: 1, createdAt: -1 },
      { status: 1, createdAt: -1 },
      { priority: 1, createdAt: -1 },
      { visibility: 1, createdAt: -1 },
      { blogCategory: 1, createdAt: -1 },
      { blogTag: 1, createdAt: -1 },
      { targetUser: 1, createdAt: -1 },
      { "metadata.source": 1, createdAt: -1 },
      { tags: 1, createdAt: -1 },
      { createdAt: -1 }, // For general time-based queries
    ],
  }
);

// Virtual for human-readable activity type
blogActivitySchema.virtual('activityTypeDisplay').get(function() {
  const displayMap = {
    'blog_created': 'Blog Created',
    'blog_updated': 'Blog Updated',
    'blog_deleted': 'Blog Deleted',
    'blog_approved': 'Blog Approved',
    'blog_rejected': 'Blog Rejected',
    'blog_published': 'Blog Published',
    'blog_unpublished': 'Blog Unpublished',
    'blog_scheduled': 'Blog Scheduled',
    'blog_unscheduled': 'Blog Unscheduled',
    'blog_draft_saved': 'Draft Saved',
    'blog_submitted_for_approval': 'Submitted for Approval',
    'blog_cover_image_uploaded': 'Cover Image Uploaded',
    'blog_cover_image_updated': 'Cover Image Updated',
    'blog_cover_image_deleted': 'Cover Image Deleted',
    'blog_content_image_uploaded': 'Content Image Uploaded',
    'blog_media_uploaded': 'Media Uploaded',
    'blog_media_deleted': 'Media Deleted',
    'category_created': 'Category Created',
    'category_updated': 'Category Updated',
    'category_deleted': 'Category Deleted',
    'category_blog_assigned': 'Category Assigned to Blog',
    'category_blog_removed': 'Category Removed from Blog',
    'tag_created': 'Tag Created',
    'tag_updated': 'Tag Updated',
    'tag_deleted': 'Tag Deleted',
    'tag_blog_assigned': 'Tag Assigned to Blog',
    'tag_blog_removed': 'Tag Removed from Blog',
    'blog_permission_granted': 'Permission Granted',
    'blog_permission_revoked': 'Permission Revoked',
    'blog_access_attempted': 'Access Attempted',
    'blog_access_denied': 'Access Denied',
    'email_approval_sent': 'Approval Email Sent',
    'email_rejection_sent': 'Rejection Email Sent',
    'email_publication_sent': 'Publication Email Sent',
    'email_schedule_sent': 'Schedule Email Sent',
    'blog_auto_published': 'Auto Published',
    'blog_auto_unpublished': 'Auto Unpublished',
    'blog_expired': 'Blog Expired',
    'blog_archived': 'Blog Archived',
    'blog_restored': 'Blog Restored',
    'blog_report_generated': 'Report Generated'
  };
  return displayMap[this.activityType] || this.activityType;
});

// Static method to log activity
blogActivitySchema.statics.logActivity = async function(activityData) {
  try {
    const activity = new this(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error logging blog activity:', error);
    throw error;
  }
};

// Static method to get user activity statistics
blogActivitySchema.statics.getUserActivityStats = async function(userId, dateRange = {}) {
  const matchQuery = {
    user: new mongoose.Types.ObjectId(userId),
  };
  
  if (dateRange.startDate || dateRange.endDate) {
    matchQuery.createdAt = {};
    if (dateRange.startDate) {
      matchQuery.createdAt.$gte = new Date(dateRange.startDate);
    }
    if (dateRange.endDate) {
      matchQuery.createdAt.$lte = new Date(dateRange.endDate);
    }
  }
  
  return await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$activityType",
        count: { $sum: 1 },
        lastActivity: { $max: "$createdAt" },
        successCount: {
          $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
        },
        failureCount: {
          $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
        }
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Static method to get blog activity timeline
blogActivitySchema.statics.getBlogActivityTimeline = async function(blogId, options = {}) {
  const matchQuery = { blog: new mongoose.Types.ObjectId(blogId) };
  
  if (options.activityTypes && options.activityTypes.length > 0) {
    matchQuery.activityType = { $in: options.activityTypes };
  }
  
  if (options.dateRange) {
    matchQuery.createdAt = {};
    if (options.dateRange.startDate) {
      matchQuery.createdAt.$gte = new Date(options.dateRange.startDate);
    }
    if (options.dateRange.endDate) {
      matchQuery.createdAt.$lte = new Date(options.dateRange.endDate);
    }
  }
  
  const pipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "targetUser", 
        foreignField: "_id",
        as: "targetUserDetails"
      }
    },
    {
      $addFields: {
        userDetails: { $arrayElemAt: ["$userDetails", 0] },
        targetUserDetails: { $arrayElemAt: ["$targetUserDetails", 0] }
      }
    },
    { $sort: { createdAt: -1 } }
  ];
  
  if (options.limit) {
    pipeline.push({ $limit: options.limit });
  }
  
  return await this.aggregate(pipeline);
};

// Static method to get activity analytics
blogActivitySchema.statics.getActivityAnalytics = async function(filters = {}) {
  const matchQuery = {};
  
  if (filters.dateRange) {
    matchQuery.createdAt = {};
    if (filters.dateRange.startDate) {
      matchQuery.createdAt.$gte = new Date(filters.dateRange.startDate);
    }
    if (filters.dateRange.endDate) {
      matchQuery.createdAt.$lte = new Date(filters.dateRange.endDate);
    }
  }
  
  if (filters.users && filters.users.length > 0) {
    matchQuery.user = { $in: filters.users.map(id => new mongoose.Types.ObjectId(id)) };
  }
  
  if (filters.activityTypes && filters.activityTypes.length > 0) {
    matchQuery.activityType = { $in: filters.activityTypes };
  }
  
  if (filters.status) {
    matchQuery.status = filters.status;
  }
  
  return await this.aggregate([
    { $match: matchQuery },
    {
      $facet: {
        // Activity type distribution
        activityTypeStats: [
          {
            $group: {
              _id: "$activityType",
              count: { $sum: 1 },
              successCount: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
              failureCount: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } }
            }
          },
          { $sort: { count: -1 } }
        ],
        
        // User activity stats
        userStats: [
          {
            $group: {
              _id: "$user",
              activityCount: { $sum: 1 },
              lastActivity: { $max: "$createdAt" }
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "userDetails"
            }
          },
          {
            $addFields: {
              userDetails: { $arrayElemAt: ["$userDetails", 0] }
            }
          },
          { $sort: { activityCount: -1 } },
          { $limit: 10 }
        ],
        
        // Daily activity trends
        dailyTrends: [
          {
            $group: {
              _id: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id.date": 1 } }
        ],
        
        // Overall stats
        overallStats: [
          {
            $group: {
              _id: null,
              totalActivities: { $sum: 1 },
              uniqueUsers: { $addToSet: "$user" },
              uniqueBlogs: { $addToSet: "$blog" },
              successCount: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
              failureCount: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } }
            }
          },
          {
            $addFields: {
              uniqueUserCount: { $size: "$uniqueUsers" },
              uniqueBlogCount: { $size: "$uniqueBlogs" },
              successRate: { 
                $multiply: [
                  { $divide: ["$successCount", "$totalActivities"] },
                  100
                ]
              }
            }
          }
        ]
      }
    }
  ]);
};

// Static method to cleanup old activities
blogActivitySchema.statics.cleanupOldActivities = async function(daysToKeep = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    priority: { $nin: ["high", "critical"] }
  });
};

module.exports = mongoose.model("BlogActivity", blogActivitySchema);