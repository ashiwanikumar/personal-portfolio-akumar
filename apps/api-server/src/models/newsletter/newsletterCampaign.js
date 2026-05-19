// ** LIBS ** //
const mongoose = require("mongoose");

const newsletterCampaignSchema = new mongoose.Schema(
  {
    // Campaign Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true
    },
    campaignType: {
      type: String,
      enum: [
        "immediate_alert",     // Emergency/critical announcements
        "scheduled_newsletter", // Regular scheduled communications
        "event_based",         // Based on events like weather, market changes
        "seasonal_advisory",   // Seasonal agricultural guidance
        "scheme_enrollment",   // Government scheme notifications
        "follow_up",          // Follow-up communications
        "survey_feedback"     // Feedback collection
      ],
      required: true,
      index: true
    },
    
    // Template and Content
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewsletterTemplate",
      required: true
    },
    customContent: {
      // Override template content if needed
      hindi: {
        subject: String,
        htmlBody: String,
        textBody: String,
        smsText: String
      },
      english: {
        subject: String,
        htmlBody: String,
        textBody: String,
        smsText: String
      }
      // Additional languages can be added
    },
    
    // Dynamic Content Variables
    variables: [{
      name: String,        // Variable name like {{weatherAlert}}
      value: String,       // Actual value to replace
      language: String     // Language-specific values
    }],
    
    // Targeting and Audience
    targeting: {
      // Geographic targeting
      locations: [{
        state: String,
        districts: [String],
        pincodes: [String]
      }],
      
      // Farmer profile targeting
      farmerCriteria: {
        farmerTypes: [String],
        crops: [String],
        landSizeMin: Number,
        landSizeMax: Number,
        hasKisanCreditCard: Boolean,
        pmKisanBeneficiary: Boolean,
        irrigationMethods: [String]
      },
      
      // Communication preferences
      languages: [String],
      communicationChannels: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      },
      
      // Subscription preferences
      subscriberPreferences: [String], // policyUpdates, cropAdvisory, etc.
      
      // Verification status
      requireEmailVerified: { type: Boolean, default: false },
      requirePhoneVerified: { type: Boolean, default: false },
      requireAadhaarVerified: { type: Boolean, default: false },
      
      // Custom filters
      customFilters: {
        type: mongoose.Schema.Types.Mixed // For complex queries
      }
    },
    
    // Scheduling
    scheduling: {
      sendImmediately: { type: Boolean, default: false },
      scheduledDateTime: { type: Date },
      timezone: { 
        type: String, 
        default: "Asia/Kolkata" 
      },
      recurring: {
        isRecurring: { type: Boolean, default: false },
        frequency: {
          type: String,
          enum: ["daily", "weekly", "monthly", "quarterly", "yearly"]
        },
        interval: { type: Number, default: 1 }, // Every X frequency
        endDate: { type: Date },
        daysOfWeek: [Number], // 0-6 for Sunday-Saturday
        dayOfMonth: Number,   // 1-31 for monthly recurring
        excludeHolidays: { type: Boolean, default: true }
      }
    },
    
    // Government Compliance
    compliance: {
      requiresApproval: { type: Boolean, default: true },
      approvalStatus: {
        type: String,
        enum: ["draft", "pending_approval", "approved", "rejected"],
        default: "draft"
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      approvedAt: { type: Date },
      approvalComments: String,
      
      // Legal compliance
      includesGovtDisclaimer: { type: Boolean, default: true },
      dataProtectionCompliant: { type: Boolean, default: false },
      emergencyOverride: { type: Boolean, default: false } // For critical alerts
    },
    
    // Campaign Status and Execution
    status: {
      type: String,
      enum: [
        "draft",
        "scheduled", 
        "sending",
        "sent",
        "paused",
        "cancelled",
        "failed"
      ],
      default: "draft",
      index: true
    },
    
    // Execution Details
    execution: {
      startedAt: { type: Date },
      completedAt: { type: Date },
      pausedAt: { type: Date },
      cancelledAt: { type: Date },
      
      // Recipient statistics
      totalTargeted: { type: Number, default: 0 },
      totalSent: { type: Number, default: 0 },
      totalFailed: { type: Number, default: 0 },
      
      // Channel-specific stats
      emailStats: {
        sent: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        opened: { type: Number, default: 0 },
        clicked: { type: Number, default: 0 },
        bounced: { type: Number, default: 0 },
        complained: { type: Number, default: 0 },
        unsubscribed: { type: Number, default: 0 }
      },
      
      smsStats: {
        sent: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        failed: { type: Number, default: 0 }
      },
      
      // Error tracking
      errors: [{
        timestamp: { type: Date, default: Date.now },
        type: String, // 'send_error', 'template_error', 'targeting_error'
        message: String,
        details: mongoose.Schema.Types.Mixed,
        resolved: { type: Boolean, default: false }
      }]
    },
    
    // Analytics and Tracking
    analytics: {
      openRate: { type: Number, default: 0 },
      clickThroughRate: { type: Number, default: 0 },
      unsubscribeRate: { type: Number, default: 0 },
      bounceRate: { type: Number, default: 0 },
      
      // Geographic performance
      stateWiseStats: [{
        state: String,
        sent: Number,
        opened: Number,
        clicked: Number
      }],
      
      // Language performance
      languageWiseStats: [{
        language: String,
        sent: Number,
        opened: Number,
        clicked: Number
      }],
      
      // Device/Platform stats
      deviceStats: {
        mobile: { opens: Number, clicks: Number },
        desktop: { opens: Number, clicks: Number },
        tablet: { opens: Number, clicks: Number }
      }
    },
    
    // Administrative
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    
    // Campaign metadata
    tags: [{ type: String, trim: true }],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    
    // Related campaigns
    parentCampaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewsletterCampaign" // For follow-up campaigns
    },
    
    // Budget tracking (if applicable)
    budget: {
      smsCredits: { type: Number, default: 0 },
      emailCredits: { type: Number, default: 0 },
      actualSmsUsed: { type: Number, default: 0 },
      actualEmailUsed: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
newsletterCampaignSchema.index({ status: 1, "scheduling.scheduledDateTime": 1 });
newsletterCampaignSchema.index({ campaignType: 1, createdAt: -1 });
newsletterCampaignSchema.index({ "targeting.locations.state": 1, "targeting.locations.districts": 1 });
newsletterCampaignSchema.index({ createdBy: 1, status: 1 });
newsletterCampaignSchema.index({ "compliance.approvalStatus": 1 });

// Methods
newsletterCampaignSchema.methods.approve = function(approvedBy, comments = null) {
  this.compliance.approvalStatus = "approved";
  this.compliance.approvedBy = approvedBy;
  this.compliance.approvedAt = new Date();
  if (comments) {
    this.compliance.approvalComments = comments;
  }
  return this.save();
};

newsletterCampaignSchema.methods.reject = function(rejectedBy, reason) {
  this.compliance.approvalStatus = "rejected";
  this.compliance.approvalComments = reason;
  return this.save();
};

newsletterCampaignSchema.methods.startExecution = function() {
  this.status = "sending";
  this.execution.startedAt = new Date();
  return this.save();
};

newsletterCampaignSchema.methods.completeExecution = function() {
  this.status = "sent";
  this.execution.completedAt = new Date();
  
  // Calculate analytics
  if (this.execution.emailStats.sent > 0) {
    this.analytics.openRate = (this.execution.emailStats.opened / this.execution.emailStats.sent) * 100;
    this.analytics.clickThroughRate = (this.execution.emailStats.clicked / this.execution.emailStats.sent) * 100;
    this.analytics.unsubscribeRate = (this.execution.emailStats.unsubscribed / this.execution.emailStats.sent) * 100;
    this.analytics.bounceRate = (this.execution.emailStats.bounced / this.execution.emailStats.sent) * 100;
  }
  
  return this.save();
};

newsletterCampaignSchema.methods.updateEmailStats = function(action, count = 1) {
  switch(action) {
    case 'sent':
      this.execution.emailStats.sent += count;
      this.execution.totalSent += count;
      break;
    case 'delivered':
      this.execution.emailStats.delivered += count;
      break;
    case 'opened':
      this.execution.emailStats.opened += count;
      break;
    case 'clicked':
      this.execution.emailStats.clicked += count;
      break;
    case 'bounced':
      this.execution.emailStats.bounced += count;
      break;
    case 'unsubscribed':
      this.execution.emailStats.unsubscribed += count;
      break;
  }
  
  return this.save();
};

newsletterCampaignSchema.methods.logError = function(type, message, details = null) {
  this.execution.errors.push({
    type,
    message,
    details,
    timestamp: new Date()
  });
  
  return this.save();
};

// Static methods
newsletterCampaignSchema.statics.findScheduledCampaigns = function() {
  return this.find({
    status: "scheduled",
    "scheduling.scheduledDateTime": { $lte: new Date() },
    "compliance.approvalStatus": "approved"
  });
};

newsletterCampaignSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ updatedAt: -1 });
};

newsletterCampaignSchema.statics.findPendingApproval = function() {
  return this.find({
    "compliance.approvalStatus": "pending_approval"
  }).sort({ createdAt: 1 });
};

// Virtual for campaign performance summary
newsletterCampaignSchema.virtual('performanceSummary').get(function() {
  return {
    totalSent: this.execution.totalSent,
    openRate: this.analytics.openRate,
    clickRate: this.analytics.clickThroughRate,
    status: this.status
  };
});

// Pre-save middleware
newsletterCampaignSchema.pre('save', function(next) {
  // Auto-calculate total targeted recipients based on targeting criteria
  if (this.isModified('targeting') && this.targeting) {
    // This would need to be calculated by the service layer
    // based on actual subscriber count matching criteria
  }
  
  // Set emergency override for critical campaigns
  if (this.priority === 'critical' && this.campaignType === 'immediate_alert') {
    this.compliance.emergencyOverride = true;
    this.compliance.requiresApproval = false;
    this.scheduling.sendImmediately = true;
  }
  
  next();
});

module.exports = mongoose.model("NewsletterCampaign", newsletterCampaignSchema);