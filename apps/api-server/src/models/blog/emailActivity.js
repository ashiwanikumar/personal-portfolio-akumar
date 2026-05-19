// ** LIBS ** //
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const emailActivitySchema = new mongoose.Schema(
  {
    // Blog reference
    blog: {
      type: ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    
    // User who triggered the email (admin who approved/unapproved)
    triggeredBy: {
      type: ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    // Recipients of the email
    recipients: [
      {
        user: {
          type: ObjectId,
          ref: "User",
        },
        email: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          enum: ["super_admin", "admin", "author", "user"],
          required: true,
        },
        // Email delivery status
        deliveryStatus: {
          type: String,
          enum: ["sent", "failed", "pending"],
          default: "sent",
        },
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
        failureReason: String,
      },
    ],
    
    // Email activity type
    activityType: {
      type: String,
      enum: ["approval", "unapproval", "blog_created", "blog_updated"],
      required: true,
      index: true,
    },
    
    // Email subject
    subject: {
      type: String,
      required: true,
    },
    
    // Email template used
    template: {
      type: String,
      required: true,
    },
    
    // Email content/body (for tracking purposes)
    content: {
      type: String,
    },
    
    // Blog details at the time of email sending
    blogSnapshot: {
      title: String,
      author: {
        type: ObjectId,
        ref: "User",
      },
      status: String,
      approved: Boolean,
    },
    
    // Additional metadata
    metadata: {
      // Comments/reason provided during approval/unapproval
      comments: String,
      
      // Previous status before the action
      previousStatus: String,
      previousApproval: Boolean,
      
      // Email sending context
      sendingContext: {
        userAgent: String,
        ipAddress: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    },
    
    // Email statistics
    statistics: {
      totalRecipients: {
        type: Number,
        default: 0,
      },
      successCount: {
        type: Number,
        default: 0,
      },
      failureCount: {
        type: Number,
        default: 0,
      },
      pendingCount: {
        type: Number,
        default: 0,
      },
    },
    
    // Status of the email activity
    status: {
      type: String,
      enum: ["completed", "partial", "failed"],
      default: "completed",
    },
    
    // Processed flag
    processed: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    // Index for efficient querying
    index: [
      { blog: 1, createdAt: -1 },
      { triggeredBy: 1, createdAt: -1 },
      { activityType: 1, createdAt: -1 },
      { "recipients.user": 1, createdAt: -1 },
    ],
  }
);

// Pre-save hook to calculate statistics
emailActivitySchema.pre("save", function (next) {
  if (this.recipients && this.recipients.length > 0) {
    this.statistics.totalRecipients = this.recipients.length;
    this.statistics.successCount = this.recipients.filter(
      (r) => r.deliveryStatus === "sent"
    ).length;
    this.statistics.failureCount = this.recipients.filter(
      (r) => r.deliveryStatus === "failed"
    ).length;
    this.statistics.pendingCount = this.recipients.filter(
      (r) => r.deliveryStatus === "pending"
    ).length;
    
    // Determine overall status
    if (this.statistics.failureCount === this.statistics.totalRecipients) {
      this.status = "failed";
    } else if (this.statistics.failureCount > 0) {
      this.status = "partial";
    } else {
      this.status = "completed";
    }
  }
  next();
});

// Static method to get user email activity statistics
emailActivitySchema.statics.getUserEmailStats = async function (userId, dateRange = {}) {
  const matchQuery = {
    triggeredBy: new mongoose.Types.ObjectId(userId),
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
        totalRecipients: { $sum: "$statistics.totalRecipients" },
        successCount: { $sum: "$statistics.successCount" },
        failureCount: { $sum: "$statistics.failureCount" },
        lastActivity: { $max: "$createdAt" },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

// Static method to get overall email activity statistics
emailActivitySchema.statics.getOverallStats = async function (dateRange = {}) {
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
  
  return await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalActivities: { $sum: 1 },
        totalRecipients: { $sum: "$statistics.totalRecipients" },
        totalSuccess: { $sum: "$statistics.successCount" },
        totalFailures: { $sum: "$statistics.failureCount" },
        approvalEmails: {
          $sum: {
            $cond: [{ $eq: ["$activityType", "approval"] }, 1, 0],
          },
        },
        unapprovalEmails: {
          $sum: {
            $cond: [{ $eq: ["$activityType", "unapproval"] }, 1, 0],
          },
        },
      },
    },
  ]);
};

// Static method to get daily email activity trends
emailActivitySchema.statics.getDailyTrends = async function (days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          activityType: "$activityType",
        },
        count: { $sum: 1 },
        recipients: { $sum: "$statistics.totalRecipients" },
      },
    },
    {
      $sort: { "_id.date": 1 },
    },
  ]);
};

module.exports = mongoose.model("EmailActivity", emailActivitySchema);