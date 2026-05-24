// ** LIBS ** //
const mongoose = require("mongoose");

const newsletterTemplateSchema = new mongoose.Schema(
  {
    // Template Basic Information
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
    category: {
      type: String,
      enum: [
        "policy_announcement",
        "scheme_notification", 
        "crop_advisory",
        "weather_alert",
        "market_update",
        "emergency_alert",
        "training_program",
        "seasonal_guidance",
        "technology_update",
        "general_newsletter"
      ],
      required: true,
      index: true
    },
    
    // Template Content (Multilingual)
    content: {
      hindi: {
        subject: { type: String, required: true },
        htmlBody: { type: String, required: true },
        textBody: { type: String },
        smsText: { type: String } // For SMS version (160 chars max)
      },
      english: {
        subject: { type: String, required: true },
        htmlBody: { type: String, required: true }, 
        textBody: { type: String },
        smsText: { type: String }
      },
      // Add other regional languages as needed
      bengali: {
        subject: String,
        htmlBody: String,
        textBody: String,
        smsText: String
      },
      tamil: {
        subject: String,
        htmlBody: String,
        textBody: String,
        smsText: String
      },
      telugu: {
        subject: String,
        htmlBody: String,
        textBody: String,
        smsText: String
      },
      marathi: {
        subject: String,
        htmlBody: String,
        textBody: String,
        smsText: String
      },
      gujarati: {
        subject: String,
        htmlBody: String,
        textBody: String,
        smsText: String
      }
    },
    
    // Template Variables/Placeholders
    variables: [{
      name: { type: String, required: true }, // e.g., {{farmerName}}, {{cropName}}
      description: { type: String },
      dataType: {
        type: String,
        enum: ["text", "number", "date", "boolean", "array"],
        default: "text"
      },
      required: { type: Boolean, default: false },
      defaultValue: { type: String }
    }],
    
    // Targeting Criteria
    targetingCriteria: {
      farmerTypes: [{
        type: String,
        enum: ["small", "marginal", "medium", "large", "landless", "sharecropper"]
      }],
      crops: [{ type: String }],
      states: [{ type: String }],
      districts: [{ type: String }],
      languages: [{ type: String }],
      schemes: [{ type: String }], // PM-KISAN, KCC, etc.
      urgencyLevel: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium"
      }
    },
    
    // Government Branding
    branding: {
      governmentLogo: { type: String }, // URL to logo
      departmentName: {
        type: String,
        default: "Ashiwani Kumar"
      },
      officialSeal: { type: String }, // URL to official seal
      footerText: {
        type: String,
        default: "Ashiwani Kumar - Personal Website"
      },
      helplineNumber: {
        type: String,
        default: ""
      },
      websiteUrl: {
        type: String,
        default: "https://ashiwanikumar.in"
      }
    },
    
    // Template Settings
    settings: {
      isActive: { type: Boolean, default: true },
      isGovernmentApproved: { type: Boolean, default: false },
      requiresApproval: { type: Boolean, default: true },
      autoTranslate: { type: Boolean, default: false }, // Auto-translate to regional languages
      trackOpens: { type: Boolean, default: true },
      trackClicks: { type: Boolean, default: true },
      includeUnsubscribeLink: { type: Boolean, default: true },
      enableSmsVersion: { type: Boolean, default: false }
    },
    
    // Approval Workflow
    approval: {
      status: {
        type: String,
        enum: ["draft", "pending_review", "approved", "rejected", "archived"],
        default: "draft"
      },
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      submittedAt: { type: Date },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      reviewedAt: { type: Date },
      approvalComments: [{ 
        text: String, 
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        addedAt: { type: Date, default: Date.now }
      }]
    },
    
    // Usage Statistics
    usage: {
      timesUsed: { type: Number, default: 0 },
      totalRecipients: { type: Number, default: 0 },
      lastUsed: { type: Date },
      avgOpenRate: { type: Number, default: 0 },
      avgClickRate: { type: Number, default: 0 }
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
    tags: [{ type: String, trim: true }]
  },
  {
    timestamps: true,
  }
);

// Indexes
newsletterTemplateSchema.index({ category: 1, "approval.status": 1 });
newsletterTemplateSchema.index({ "settings.isActive": 1, "settings.isGovernmentApproved": 1 });
newsletterTemplateSchema.index({ createdBy: 1, updatedAt: -1 });

// Methods
newsletterTemplateSchema.methods.approve = function(approvedBy, comments = null) {
  this.approval.status = "approved";
  this.approval.reviewedBy = approvedBy;
  this.approval.reviewedAt = new Date();
  this.settings.isGovernmentApproved = true;
  
  if (comments) {
    this.approval.approvalComments.push({
      text: comments,
      addedBy: approvedBy,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

newsletterTemplateSchema.methods.reject = function(rejectedBy, reason) {
  this.approval.status = "rejected";
  this.approval.reviewedBy = rejectedBy;
  this.approval.reviewedAt = new Date();
  
  this.approval.approvalComments.push({
    text: `Rejected: ${reason}`,
    addedBy: rejectedBy,
    addedAt: new Date()
  });
  
  return this.save();
};

newsletterTemplateSchema.methods.updateUsageStats = function(recipients, openRate, clickRate) {
  this.usage.timesUsed += 1;
  this.usage.totalRecipients += recipients;
  this.usage.lastUsed = new Date();
  
  // Calculate weighted average
  const totalUsage = this.usage.timesUsed;
  this.usage.avgOpenRate = ((this.usage.avgOpenRate * (totalUsage - 1)) + openRate) / totalUsage;
  this.usage.avgClickRate = ((this.usage.avgClickRate * (totalUsage - 1)) + clickRate) / totalUsage;
  
  return this.save();
};

// Static methods
newsletterTemplateSchema.statics.findApprovedTemplates = function(category = null) {
  const query = {
    "approval.status": "approved",
    "settings.isActive": true
  };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query).sort({ updatedAt: -1 });
};

newsletterTemplateSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category,
    "settings.isActive": true 
  }).sort({ "usage.timesUsed": -1 });
};

// Pre-save middleware
newsletterTemplateSchema.pre('save', function(next) {
  // Ensure at least Hindi and English content exists
  if (!this.content.hindi.subject || !this.content.english.subject) {
    return next(new Error('Hindi and English content are mandatory'));
  }
  
  // Update lastModifiedBy if this is an update
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.createdBy; // This should be set by the controller
  }
  
  next();
});

module.exports = mongoose.model("NewsletterTemplate", newsletterTemplateSchema);