// ** LIBS ** //
const mongoose = require("mongoose");

const abuseComplaintSchema = new mongoose.Schema(
  {
    abuseType: {
      type: String,
      required: true,
      enum: [
        "spam",
        "phish",
        "content",
        "malware",
        "Account Breach",
        "Internal review requested",
        "Other",
      ],
      index: true,
    },
    abuseMedium: {
      type: String,
      required: true,
      enum: [
        "AbuseMediumEmail",
        "AbuseMediumContent",
        "AbuseMediumURL",
        "Calling",
        "SMS",
        "Account Breach",
        "No Abuse",
        "Other",
      ],
      index: true,
    },
    reporter: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },
    },
    comments: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "under_review", "resolved", "rejected", "duplicate"],
      default: "new",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    resolution: {
      action: {
        type: String,
        enum: ["no_action", "warning", "suspension", "ban", "other"],
        required: false,
      },
      notes: {
        type: String,
        default: null,
      },
      date: {
        type: Date,
        default: null,
      },
    },
    relatedComplaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AbuseComplaint",
      },
    ],
    evidenceUrls: [
      {
        type: String,
        trim: true,
      },
    ],

    // Advanced Technical information fields
    technicalInfo: {
      // Network information
      network: {
        ip: {
          ipv4: String,
          ipv6: String,
          real: String, // Real IP (from WebRTC if available)
          local: String, // Local IP (LAN address)
        },
        location: {
          country: String,
          countryCode: String,
          region: String,
          city: String,
          postal: String,
          timezone: String,
          coordinates: {
            latitude: Number,
            longitude: Number,
          },
        },
        isp: {
          name: String, // Internet Service Provider
          organization: String, // Organization name
          asn: String, // Autonomous System Number
          domain: String, // Domain name
          // Additional network information from geolocation services
          mobile: Boolean, // Whether connection is mobile
          proxy: Boolean, // Whether IP is a proxy
          hosting: Boolean, // Whether IP is from hosting provider
          query: String, // Original IP query
        },
        quality: {
          connectionType: String, // '4g', '3g', 'wifi', 'ethernet'
          estimatedBandwidth: Number,
          latency: Number,
          packetLoss: Number,
          jitter: Number,
          quality: String, // 'excellent', 'good', 'fair', 'poor'
        },
      },

      // Browser information
      browser: {
        userAgent: String,
        language: String,
        languages: [String],
        name: String,
        version: String,
        engine: String,
        cookiesEnabled: Boolean,
        javaScriptEnabled: Boolean,
        plugins: [
          {
            name: String,
            description: String,
            filename: String,
            version: String,
          },
        ],
        mimeTypes: [
          {
            type: String,
            description: String,
            suffixes: String,
          },
        ],
        headless: {
          isHeadless: Boolean,
          indicators: [String],
        },
        automationTool: String, // selenium, puppeteer, etc.
      },

      // Device information
      device: {
        deviceType: String, // mobile, tablet, desktop, gaming (renamed to avoid conflict)
        model: String,
        vendor: String,
        os: {
          name: String,
          version: String,
        },
        screen: {
          width: Number,
          height: Number,
          colorDepth: Number,
          pixelRatio: Number,
          orientation: String,
        },
        hardware: {
          concurrency: Number, // CPU cores
          memory: Number, // Device memory in GB
          gpu: {
            vendor: String,
            renderer: String,
          },
        },
        sensors: {
          touch: Boolean,
          gyroscope: Boolean,
          accelerometer: Boolean,
          magnetometer: Boolean,
        },
        battery: {
          level: Number,
          charging: Boolean,
          chargingTime: Number,
          dischargingTime: Number,
        },
      },

      // Security analysis
      security: {
        isProxy: Boolean,
        isVPN: Boolean,
        isTor: Boolean,
        isBot: Boolean,
        isSuspicious: Boolean,
        isDataCenter: Boolean,
        riskScore: Number,
        flags: [String],
        details: {
          proxy: {
            isProxy: Boolean,
            isVPN: Boolean,
            confidence: Number,
            indicators: [String],
          },
          tor: {
            isTor: Boolean,
            confidence: Number,
            indicators: [String],
          },
          bot: {
            isBot: Boolean,
            botType: String,
            confidence: Number,
            indicators: [String],
          },
          dataCenter: {
            isDataCenter: Boolean,
            provider: String,
            confidence: Number,
          },
          tls: {
            version: String,
            cipher: String,
            fingerprint: String,
          },
        },
        webrtc: {
          localIP: String,
          publicIP: String,
          hasLeak: Boolean,
        },
      },

      // Fingerprinting
      fingerprint: {
        hash: String, // Main device fingerprint
        uniqueness: Number, // Uniqueness score (0-100)
        components: {
          canvas: String, // Canvas fingerprint hash
          webgl: String, // WebGL fingerprint hash
          audio: String, // Audio context fingerprint hash
          fonts: Number, // Number of detected fonts
        },
      },

      // Privacy settings
      privacy: {
        doNotTrack: Boolean,
        globalPrivacyControl: Boolean,
        consentGiven: Boolean,
        privacyMode: Boolean,
        preferences: mongoose.Schema.Types.Mixed,
      },

      // Performance metrics
      performance: {
        loadTime: Number,
        renderTime: Number,
        resourceTiming: [
          {
            name: String,
            duration: Number,
            size: Number,
            type: String,
          },
        ],
        memory: {
          usedJSHeapSize: Number,
          totalJSHeapSize: Number,
          jsHeapSizeLimit: Number,
        },
      },

      // Metadata
      metadata: {
        collectedAt: {
          type: Date,
          default: Date.now,
        },
        collectionTime: Number, // Time taken to collect info (ms)
        referrer: String,
        campaign: {
          source: String, // utm_source
          medium: String, // utm_medium
          campaign: String, // utm_campaign
          term: String, // utm_term
          content: String, // utm_content
        },
        version: { type: String, default: "2.0" }, // Advanced collector version
        formVersion: { type: String, default: "1.0" },
        submissionMethod: {
          type: String,
          enum: ["web", "mobile", "api"],
          default: "web",
        },
      },
    },
    notes: [
      {
        content: {
          type: String,
          required: true,
          trim: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        lastEdited: {
          type: Date,
          default: null,
        },
        editHistory: [
          {
            previousContent: {
              type: String,
              required: true,
              trim: true,
            },
            editedBy: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            editedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add method to update note
abuseComplaintSchema.methods.updateNote = async function (
  noteId,
  content,
  userId
) {
  const note = this.notes.id(noteId);
  if (!note) {
    throw new Error("Note not found");
  }

  // Save the current content to edit history
  note.editHistory.push({
    previousContent: note.content,
    editedBy: userId,
    editedAt: new Date(),
  });

  // Index for efficient querying of unresolved high-priority complaints
  abuseComplaintSchema.index({ status: 1, priority: 1 });

  // Index for searching by email
  abuseComplaintSchema.index({ "reporter.email": 1 });

  // Indexes for technical information (advanced)
  abuseComplaintSchema.index({ "technicalInfo.network.ip.ipv4": 1 });
  abuseComplaintSchema.index({ "technicalInfo.network.location.country": 1 });
  abuseComplaintSchema.index({ "technicalInfo.network.isp.asn": 1 });
  abuseComplaintSchema.index({ "technicalInfo.metadata.collectedAt": 1 });
  abuseComplaintSchema.index({ "technicalInfo.security.riskScore": 1 });
  abuseComplaintSchema.index({ "technicalInfo.fingerprint.hash": 1 });
  abuseComplaintSchema.index({ "technicalInfo.security.isBot": 1 });
  abuseComplaintSchema.index({ "technicalInfo.security.isProxy": 1 });
  abuseComplaintSchema.index({ "technicalInfo.security.isVPN": 1 });
  abuseComplaintSchema.index({ "technicalInfo.security.isTor": 1 });

  // Method to update complaint status
  abuseComplaintSchema.methods.updateStatus = function (
    newStatus,
    reviewerId,
    notes = ""
  ) {
    this.status = newStatus;
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    if (notes) {
      this.resolution.notes = notes;
    }
    return this.save();
  };

  // Update the note content and lastEdited
  note.content = content;
  note.lastEdited = new Date();

  return this.save();
};

// Method to escalate priority
abuseComplaintSchema.methods.escalate = function (newPriority = "high") {
  this.priority = newPriority;
  return this.save();
};

// Method to mark as duplicate and link to original complaint
abuseComplaintSchema.methods.markAsDuplicate = function (originalComplaintId) {
  this.status = "duplicate";
  this.relatedComplaints.push(originalComplaintId);
  return this.save();
};

// Method to resolve complaint
abuseComplaintSchema.methods.resolve = function (action, notes = "") {
  this.status = "resolved";
  this.resolution = {
    action,
    notes,
    date: new Date(),
  };
  return this.save();
};

// Static method to find similar complaints
abuseComplaintSchema.statics.findSimilar = function (complaint) {
  return this.find({
    "reporter.email": complaint.reporter.email,
    abuseType: complaint.abuseType,
    createdAt: {
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    },
  });
};

module.exports = mongoose.model("AbuseComplaint", abuseComplaintSchema);
