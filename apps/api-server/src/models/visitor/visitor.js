/**
 * Enhanced Visitor Model
 * 
 * Comprehensive visitor tracking model with real-time capabilities
 * Includes all necessary fields for advanced analytics and live tracking
 */

const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  // === SESSION TRACKING ===
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  fingerprint: {
    type: String,
    required: true,
    index: true
  },
  visitorId: {
    type: String, // Unique identifier across sessions
    index: true
  },

  // === NETWORK & IP INFORMATION ===
  realIP: {
    type: String,
    required: true,
    index: true
  },
  cdnIP: {
    type: String, // CDN/Proxy IP if different from real IP
    index: true
  },
  ipType: {
    type: String,
    enum: ['ipv4', 'ipv6', 'unknown'],
    default: 'ipv4'
  },

  // === ENHANCED LOCATION DATA ===
  country: {
    type: String,
    required: true,
    index: true
  },
  countryCode: {
    type: String,
    required: true,
    index: true
  },
  region: String,
  regionCode: String,
  city: {
    type: String,
    index: true
  },
  district: String,
  zipCode: String,
  
  // Coordinates with geospatial indexing
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [longitude, latitude] - index temporarily disabled
      // index: '2dsphere'
    }
  },
  latitude: Number,
  longitude: Number,
  
  // Time and locale
  timezone: String,
  utcOffset: Number,

  // === ISP & NETWORK DETAILS ===
  isp: String,
  org: String,
  as: String, // Autonomous System
  connectionType: String, // wifi, cellular, ethernet, etc.
  
  // === SECURITY & QUALITY FLAGS ===
  isBot: {
    type: Boolean,
    default: false,
    index: true
  },
  isProxy: {
    type: Boolean,
    default: false
  },
  isVPN: {
    type: Boolean,
    default: false
  },
  isHosting: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  threatLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'unknown'],
    default: 'low'
  },

  // === DEVICE & BROWSER INFORMATION ===
  browser: {
    name: String,
    version: String,
    engine: String,
    engineVersion: String
  },
  os: {
    name: String,
    version: String
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'smart-tv', 'bot', 'unknown'],
      default: 'desktop',
      index: true
    },
    vendor: String,
    model: String,
    brand: String
  },
  
  // === SCREEN & DISPLAY ===
  screen: {
    width: Number,
    height: Number,
    density: Number,
    colorDepth: Number,
    orientation: {
      type: String,
      enum: ['portrait', 'landscape', 'unknown']
    }
  },

  // === PAGE & NAVIGATION ===
  url: {
    type: String,
    required: true,
    index: true
  },
  path: {
    type: String,
    required: true,
    index: true
  },
  domain: String,
  subdomain: String,
  
  referrer: String,
  referrerDomain: {
    type: String,
    index: true
  },
  referrerType: {
    type: String,
    enum: ['direct', 'search', 'social', 'email', 'referral', 'unknown'],
    default: 'unknown',
    index: true
  },

  // === UTM & MARKETING ATTRIBUTION ===
  utm: {
    source: {
      type: String,
      index: true
    },
    medium: {
      type: String,
      index: true
    },
    campaign: {
      type: String,
      index: true
    },
    term: String,
    content: String
  },

  // === TECHNICAL CAPABILITIES ===
  capabilities: {
    cookieEnabled: {
      type: Boolean,
      default: true
    },
    javascriptEnabled: {
      type: Boolean,
      default: true
    },
    webglEnabled: Boolean,
    touchSupport: Boolean,
    localStorage: Boolean,
    sessionStorage: Boolean,
    indexedDB: Boolean
  },

  // === LANGUAGE & LOCALE ===
  language: {
    primary: String,
    accepted: [String]
  },
  locale: String,

  // === PERFORMANCE METRICS ===
  performance: {
    pageLoadTime: Number,
    dnsTime: Number,
    connectTime: Number,
    responseTime: Number,
    domReadyTime: Number,
    onLoadTime: Number,
    navigationTiming: mongoose.Schema.Types.Mixed
  },

  // === ENGAGEMENT METRICS ===
  engagement: {
    timeOnPage: Number, // milliseconds
    scrollDepth: Number, // percentage
    clickCount: Number,
    keystrokes: Number,
    mouseMovements: Number,
    focusTime: Number, // time page was in focus
    idleTime: Number   // time page was idle
  },

  // === CUSTOM EVENT TRACKING ===
  eventType: {
    type: String,
    index: true
  },
  eventName: {
    type: String,
    index: true
  },
  eventData: mongoose.Schema.Types.Mixed,
  eventCategory: {
    type: String,
    index: true
  },
  eventValue: Number,

  // === SESSION & VISIT INFORMATION ===
  visit: {
    isFirstVisit: {
      type: Boolean,
      default: false,
      index: true
    },
    isReturning: {
      type: Boolean,
      default: false,
      index: true
    },
    visitNumber: {
      type: Number,
      default: 1
    },
    sessionNumber: {
      type: Number,
      default: 1
    },
    lastVisitDate: Date,
    daysSinceLastVisit: Number
  },

  // === REAL-TIME STATUS ===
  status: {
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true
    },
    sessionDuration: Number, // milliseconds
    heartbeatCount: {
      type: Number,
      default: 1
    }
  },

  // === GEOLOCATION DATA SOURCE ===
  geoSource: {
    provider: {
      type: String,
      enum: ['ip-api', 'ip-api-visitor', 'ipapi-co', 'ipinfo', 'maxmind', 'local', 'local-visitor', 'fallback'],
      default: 'ip-api'
    },
    accuracy: {
      type: String,
      enum: ['high', 'medium', 'low', 'none', 'exact'],
      default: 'high'
    },
    timestamp: Date,
    cached: {
      type: Boolean,
      default: false
    }
  },

  // === USER AGENT & TECHNICAL DETAILS ===
  userAgent: {
    raw: String,
    parsed: mongoose.Schema.Types.Mixed,
    fingerprint: String
  },

  // === ADDITIONAL METADATA ===
  metadata: {
    // CDN Information
    cdn: {
      provider: String, // cloudflare, aws, fastly, etc.
      pop: String,      // Point of Presence
      ray: String       // Request Ray ID
    },
    
    // Request headers (selective)
    headers: {
      acceptLanguage: String,
      acceptEncoding: String,
      connection: String,
      dnt: String, // Do Not Track
      secFetchSite: String,
      secFetchMode: String
    },
    
    // Privacy & Compliance
    privacy: {
      gdprConsent: Boolean,
      ccpaOptOut: Boolean,
      cookieConsent: Boolean,
      trackingConsent: Boolean
    },
    
    // Quality scores
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    
    // Custom fields for extensions
    custom: mongoose.Schema.Types.Mixed
  },

  // === TRACKING VERSIONING ===
  trackingVersion: {
    type: String,
    default: '2.0-enhanced'
  },
  
  // === PROCESSING STATUS ===
  processed: {
    enriched: {
      type: Boolean,
      default: false
    },
    analyzed: {
      type: Boolean,
      default: false
    },
    exported: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  collection: 'visitors_v2'
});

// === INDEXES FOR PERFORMANCE === (TEMPORARILY DISABLED)

// Compound indexes for common queries
// visitorSchema.index({ createdAt: -1, country: 1 });
// visitorSchema.index({ 'status.isActive': 1, 'status.lastActivity': -1 });
// visitorSchema.index({ path: 1, createdAt: -1 });
// visitorSchema.index({ sessionId: 1, createdAt: -1 });
// visitorSchema.index({ realIP: 1, createdAt: -1 });
// visitorSchema.index({ 'utm.source': 1, 'utm.campaign': 1 });
// visitorSchema.index({ referrerType: 1, referrerDomain: 1 });
// visitorSchema.index({ 'device.type': 1, 'browser.name': 1 });
// visitorSchema.index({ 'language.primary': 1 });

// Text index for search functionality - temporarily disabled
// visitorSchema.index({
//   country: 'text',
//   city: 'text',
//   realIP: 'text',
//   path: 'text',
//   referrerDomain: 'text'
// }, {
//   default_language: 'none'
// });

// TTL index for data retention (optional - 1 year default)
visitorSchema.index(
  { createdAt: 1 }, 
  { 
    expireAfterSeconds: process.env.VISITOR_DATA_RETENTION_DAYS 
      ? parseInt(process.env.VISITOR_DATA_RETENTION_DAYS) * 24 * 60 * 60 
      : 365 * 24 * 60 * 60 // 1 year default
  }
);

// === VIRTUAL FIELDS ===

// Full location string
visitorSchema.virtual('fullLocation').get(function() {
  const parts = [this.city, this.region, this.country].filter(Boolean);
  return parts.join(', ');
});

// Device description
visitorSchema.virtual('deviceDescription').get(function() {
  return `${this.browser.name} ${this.browser.version} on ${this.os.name} (${this.device.type})`;
});

// Session age in minutes
visitorSchema.virtual('sessionAge').get(function() {
  if (this.status.lastActivity) {
    return Math.round((Date.now() - this.status.lastActivity.getTime()) / (1000 * 60));
  }
  return 0;
});

// Is session recent (within last 30 minutes)
visitorSchema.virtual('isRecentSession').get(function() {
  return this.sessionAge <= 30;
});

// === METHODS ===

// Update activity timestamp
visitorSchema.methods.updateActivity = function() {
  this.status.lastActivity = new Date();
  this.status.heartbeatCount += 1;
  return this.save();
};

// Mark as inactive
visitorSchema.methods.markInactive = function() {
  this.status.isActive = false;
  return this.save();
};

// Calculate session duration
visitorSchema.methods.calculateSessionDuration = function() {
  if (this.createdAt && this.status.lastActivity) {
    this.status.sessionDuration = this.status.lastActivity.getTime() - this.createdAt.getTime();
  }
  return this.status.sessionDuration || 0;
};

// === STATIC METHODS ===

// Find active visitors
visitorSchema.statics.findActiveVisitors = function(minutesThreshold = 30) {
  const cutoff = new Date(Date.now() - minutesThreshold * 60 * 1000);
  return this.find({
    'status.isActive': true,
    'status.lastActivity': { $gte: cutoff }
  });
};

// Find visitors by country
visitorSchema.statics.findByCountry = function(countryCode, limit = 100) {
  return this.find({ countryCode })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Get real-time statistics
visitorSchema.statics.getRealTimeStats = function(minutesBack = 60) {
  const cutoff = new Date(Date.now() - minutesBack * 60 * 1000);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: cutoff } } },
    {
      $group: {
        _id: null,
        totalVisitors: { $sum: 1 },
        uniqueCountries: { $addToSet: '$countryCode' },
        uniqueIPs: { $addToSet: '$realIP' },
        activeSessions: {
          $sum: {
            $cond: [
              { $eq: ['$status.isActive', true] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalVisitors: 1,
        uniqueCountries: { $size: '$uniqueCountries' },
        uniqueIPs: { $size: '$uniqueIPs' },
        activeSessions: 1
      }
    }
  ]);
};

// === MIDDLEWARE ===

// Pre-save middleware (TEMPORARILY DISABLED)
// visitorSchema.pre('save', function(next) {
//   // Set geospatial coordinates if lat/lng available
//   if (this.latitude && this.longitude) {
//     this.location = {
//       type: 'Point',
//       coordinates: [this.longitude, this.latitude]
//     };
//   }
  
//   // Calculate session duration
//   this.calculateSessionDuration();
  
//   // Set UTC offset from timezone
//   if (this.timezone) {
//     try {
//       const now = new Date();
//       const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
//       this.utcOffset = utc.getTimezoneOffset();
//     } catch (error) {
//       // Ignore timezone parsing errors
//     }
//   }
  
//   next();
// });

// Post-save middleware for cleanup (TEMPORARILY DISABLED)
// visitorSchema.post('save', function(doc) {
//   // Mark old sessions as inactive (optional background task)
//   if (doc.status.isActive) {
//     setTimeout(() => {
//       const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
//       this.model('Visitor').updateMany(
//         {
//           sessionId: { $ne: doc.sessionId },
//           realIP: doc.realIP,
//           'status.lastActivity': { $lt: fiveMinutesAgo },
//           'status.isActive': true
//         },
//         {
//           $set: { 'status.isActive': false }
//         }
//       ).exec();
//     }, 1000);
//   }
// });

module.exports = mongoose.model('Visitor', visitorSchema);