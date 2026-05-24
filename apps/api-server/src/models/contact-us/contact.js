const mongoose = require("mongoose");

// Note schema for contact notes
const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
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
    },
    editHistory: [
      {
        previousContent: String,
        editedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { _id: true }
);

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    message: {
      type: Object, // Consider changing to String if message is text-only
      default: {},
    },
    category: {
      id: {
        type: String,
        required: true,
        enum: [
          "services", "feedback", "analyst",
          "devops-consulting", "cloud-infrastructure", "kubernetes",
          "ci-cd", "other",
        ],
      },
      name: {
        type: String,
        required: true,
      },
    },
    // Technical information fields
    technicalInfo: {
      ip: {
        ipv4: String,
        ipv6: String,
      },
      location: {
        country: String,
        countryCode: String,
        city: String,
        region: String,
        postal: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
        timezone: String,
      },
      network: {
        isp: String, // Internet Service Provider
        organization: String, // Organization name
        asn: String, // Autonomous System Number
        domain: String, // Domain name
      },
      browser: {
        userAgent: String,
        language: String,
        name: String,
        version: String,
      },
      device: {
        type: String, // mobile, tablet, desktop, laptop
        model: String,
        vendor: String,
        os: {
          name: String,
          version: String,
        },
        screen: {
          width: Number,
          height: Number,
          pixelRatio: Number,
        },
      },
      metadata: {
        collectedAt: {
          type: Date,
          default: Date.now,
        },
        referrer: String,
        utmSource: String,
        utmMedium: String,
        utmCampaign: String,
        formVersion: { type: String, default: "1.0" },
        submissionMethod: {
          type: String,
          enum: ["web", "mobile", "api"],
          default: "web",
        },
      },
    },
    // Admin fields
    isSpam: {
      type: Boolean,
      default: false,
      index: true,
    },
    spamInfo: {
      notes: String,
      flaggedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      flaggedAt: Date,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastUpdatedAt: Date,
    notes: [noteSchema],
  },
  { timestamps: true }
);

// Index for querying by IP or location
contactSchema.index({ "technicalInfo.ip.ipv4": 1 });
contactSchema.index({ "technicalInfo.location.country": 1 });
contactSchema.index({ createdAt: 1 });
contactSchema.index({ isSpam: 1, createdAt: -1 });
// Add index for category
contactSchema.index({ "category.id": 1 });

module.exports = mongoose.model("Contact", contactSchema);
