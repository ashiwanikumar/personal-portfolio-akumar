const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userRole: {
      type: String,
      required: true,
      index: true,
    },

    // Login result
    loginStatus: {
      type: String,
      enum: ["success", "failed"],
      required: true,
      default: "success",
      index: true,
    },
    failureReason: {
      type: String, // For failed logins
    },

    // Network and location information
    network: {
      ipAddress: {
        type: String,
        required: true,
        index: true,
      },
      realIpAddress: {
        type: String, // Real IP behind proxies/CDN
      },
      userAgent: {
        type: String,
        required: true,
      },
      headers: {
        type: Object, // Store relevant request headers
        default: {},
      },
    },

    // Geographic location
    location: {
      country: String,
      region: String, 
      city: String,
      postalCode: String,
      latitude: Number,
      longitude: Number,
      timezone: String,
      isp: String,
      organization: String,
    },

    // Device and browser information
    device: {
      type: {
        type: String, // mobile, tablet, desktop
      },
      vendor: String,
      model: String,
      os: {
        name: String,
        version: String,
        platform: String,
      },
      browser: {
        name: String,
        version: String,
        fullVersion: String,
        engine: String,
      },
      screen: {
        width: Number,
        height: Number,
        pixelRatio: Number,
      },
      touchSupport: Boolean,
      language: String,
      timezone: String,
    },

    // Security analysis
    security: {
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      isProxy: {
        type: Boolean,
        default: false,
      },
      isVPN: {
        type: Boolean,
        default: false,
      },
      isMobile: {
        type: Boolean,
        default: false,
      },
      isTor: {
        type: Boolean,
        default: false,
      },
      isBot: {
        type: Boolean,
        default: false,
      },
      threatLevel: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "low",
      },
    },

    // Session information
    session: {
      sessionId: String,
      accessToken: String, // Hashed or truncated for audit
      refreshToken: String, // Hashed or truncated for audit
      sessionDuration: Number, // In minutes
      sessionEndedAt: Date,
      logoutMethod: {
        type: String,
        enum: ["manual", "timeout", "forced", "token_expired"],
      },
    },

    // Technical details (from frontend)
    frontendData: {
      browserFeatures: {
        cookiesEnabled: Boolean,
        localStorage: Boolean,
        sessionStorage: Boolean,
        indexedDB: Boolean,
        webGL: Boolean,
        canvas: Boolean,
      },
      hardware: {
        hardwareConcurrency: Number,
        deviceMemory: Number,
        connectionType: String,
        connectionDownlink: Number,
        connectionRtt: Number,
      },
      plugins: [String],
      fonts: [String],
      fingerprint: String, // Device fingerprint hash
    },

    // Audit and compliance
    audit: {
      dataRetentionDays: {
        type: Number,
        default: 365, // Keep for 1 year by default
      },
      complianceFlags: {
        gdprProcessed: {
          type: Boolean,
          default: false,
        },
        dataMinimized: {
          type: Boolean,
          default: false,
        },
        userConsent: {
          type: Boolean,
          default: false,
        },
      },
      notes: String, // Additional audit notes
    },

    // Metadata
    metadata: {
      source: {
        type: String,
        default: "web_login",
        enum: ["web_login", "api_login", "mobile_login", "admin_login"],
      },
      version: {
        type: String,
        default: "1.0.0", // System version during login
      },
      environment: {
        type: String,
        default: "production",
        enum: ["development", "staging", "production"],
      },
      collectionMethod: {
        type: String,
        default: "automatic",
        enum: ["automatic", "manual", "api"],
      },
    },

    // Timestamps
    loginAttemptedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    loginCompletedAt: {
      type: Date,
      index: true,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
loginActivitySchema.index({ userId: 1, createdAt: -1 });
loginActivitySchema.index({ userEmail: 1, createdAt: -1 });
loginActivitySchema.index({ userRole: 1, createdAt: -1 });
loginActivitySchema.index({ loginStatus: 1, createdAt: -1 });
loginActivitySchema.index({ "network.ipAddress": 1, createdAt: -1 });
loginActivitySchema.index({ "location.country": 1, createdAt: -1 });
loginActivitySchema.index({ "device.type": 1, createdAt: -1 });
loginActivitySchema.index({ "security.riskScore": 1, createdAt: -1 });
loginActivitySchema.index({ "security.threatLevel": 1, createdAt: -1 });
loginActivitySchema.index({ loginAttemptedAt: -1 });
loginActivitySchema.index({ lastAccessedAt: -1 });

// Compound indexes for common queries
loginActivitySchema.index({ userId: 1, loginStatus: 1, createdAt: -1 });
loginActivitySchema.index({ userEmail: 1, loginStatus: 1, createdAt: -1 });
loginActivitySchema.index({ "network.ipAddress": 1, loginStatus: 1, createdAt: -1 });

// Virtual for formatted location
loginActivitySchema.virtual("formattedLocation").get(function () {
  const parts = [];
  if (this.location.city) parts.push(this.location.city);
  if (this.location.region) parts.push(this.location.region);
  if (this.location.country) parts.push(this.location.country);
  return parts.length > 0 ? parts.join(", ") : "Unknown Location";
});

// Virtual for device summary
loginActivitySchema.virtual("deviceSummary").get(function () {
  const parts = [];
  if (this.device.vendor) parts.push(this.device.vendor);
  if (this.device.model) parts.push(this.device.model);
  if (this.device.type) parts.push(this.device.type);
  return parts.length > 0 ? parts.join(" ") : "Unknown Device";
});

// Virtual for browser summary
loginActivitySchema.virtual("browserSummary").get(function () {
  if (this.device.browser.name && this.device.browser.version) {
    return `${this.device.browser.name} ${this.device.browser.version}`;
  }
  return this.device.browser.name || "Unknown Browser";
});

// Virtual for session duration in readable format
loginActivitySchema.virtual("sessionDurationFormatted").get(function () {
  if (!this.session.sessionDuration) return "Unknown";
  
  const minutes = this.session.sessionDuration;
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
});

// Method to check if login is suspicious
loginActivitySchema.methods.isSuspicious = function () {
  return (
    this.security.riskScore > 70 ||
    this.security.threatLevel === "high" ||
    this.security.threatLevel === "critical" ||
    this.security.isProxy ||
    this.security.isVPN ||
    this.security.isTor ||
    this.security.isBot
  );
};

// Method to get security status
loginActivitySchema.methods.getSecurityStatus = function () {
  if (this.security.threatLevel === "critical" || this.security.riskScore > 90) {
    return "critical";
  }
  if (this.security.threatLevel === "high" || this.security.riskScore > 70) {
    return "high";
  }
  if (this.security.threatLevel === "medium" || this.security.riskScore > 40) {
    return "medium";
  }
  return "low";
};

// Static method to get login statistics for a user
loginActivitySchema.statics.getUserStats = function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        loginAttemptedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalLogins: { $sum: 1 },
        successfulLogins: {
          $sum: { $cond: [{ $eq: ["$loginStatus", "success"] }, 1, 0] },
        },
        failedLogins: {
          $sum: { $cond: [{ $eq: ["$loginStatus", "failed"] }, 1, 0] },
        },
        uniqueLocations: { $addToSet: "$location.city" },
        uniqueIPs: { $addToSet: "$network.ipAddress" },
        uniqueDevices: { $addToSet: "$device.type" },
        suspiciousLogins: {
          $sum: {
            $cond: [
              { $or: [
                { $gt: ["$security.riskScore", 70] },
                { $eq: ["$security.isProxy", true] },
                { $eq: ["$security.isVPN", true] },
              ]},
              1,
              0,
            ],
          },
        },
        avgRiskScore: { $avg: "$security.riskScore" },
        lastLogin: { $max: "$loginAttemptedAt" },
      },
    },
    {
      $project: {
        _id: 0,
        totalLogins: 1,
        successfulLogins: 1,
        failedLogins: 1,
        uniqueLocationCount: { $size: "$uniqueLocations" },
        uniqueIPCount: { $size: "$uniqueIPs" },
        uniqueDeviceCount: { $size: "$uniqueDevices" },
        suspiciousLogins: 1,
        avgRiskScore: { $round: ["$avgRiskScore", 2] },
        lastLogin: 1,
      },
    },
  ]);
};

// Static method to get recent login activities for a user
loginActivitySchema.statics.getRecentActivity = function (userId, options = {}) {
  const { page = 1, limit = 20, status = null, days = null } = options;
  const skip = (page - 1) * limit;
  
  const query = { userId: new mongoose.Types.ObjectId(userId) };
  
  if (status) {
    query.loginStatus = status;
  }
  
  if (days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    query.loginAttemptedAt = { $gte: startDate };
  }

  return this.find(query)
    .sort({ loginAttemptedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Static method to find suspicious activities
loginActivitySchema.statics.getSuspiciousActivities = function (options = {}) {
  const { page = 1, limit = 50, days = 7 } = options;
  const skip = (page - 1) * limit;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    loginAttemptedAt: { $gte: startDate },
    $or: [
      { "security.riskScore": { $gt: 70 } },
      { "security.threatLevel": { $in: ["high", "critical"] } },
      { "security.isProxy": true },
      { "security.isVPN": true },
      { "security.isTor": true },
      { "security.isBot": true },
    ],
  })
    .populate("userId", "name email role")
    .sort({ "security.riskScore": -1, loginAttemptedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Pre-save middleware to set completion time for successful logins
loginActivitySchema.pre("save", function (next) {
  if (this.isNew && this.loginStatus === "success" && !this.loginCompletedAt) {
    this.loginCompletedAt = new Date();
  }
  next();
});

// TTL index for automatic cleanup of old records (optional)
// Uncomment if you want automatic cleanup after a certain period
// loginActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 1 year

module.exports = mongoose.model("LoginActivity", loginActivitySchema);