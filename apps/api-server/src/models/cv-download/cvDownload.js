const mongoose = require("mongoose");

const cvDownloadSchema = new mongoose.Schema(
  {
    // Action type
    action: {
      type: String,
      enum: ["view", "download", "open_tab"],
      required: true,
      index: true,
    },

    // IP & Network
    ip: {
      type: String,
      required: true,
      index: true,
    },
    ipType: {
      type: String,
      enum: ["ipv4", "ipv6", "unknown"],
      default: "unknown",
    },

    // Geolocation
    country: { type: String, default: "Unknown" },
    countryCode: { type: String, default: "XX" },
    region: { type: String, default: "" },
    city: { type: String, default: "" },
    latitude: { type: Number },
    longitude: { type: Number },
    timezone: { type: String, default: "" },
    isp: { type: String, default: "" },

    // Device & Browser
    userAgent: { type: String, default: "" },
    browser: { type: String, default: "" },
    browserVersion: { type: String, default: "" },
    os: { type: String, default: "" },
    osVersion: { type: String, default: "" },
    device: { type: String, default: "" },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "bot", "unknown"],
      default: "unknown",
    },

    // Referral & Source
    referrer: { type: String, default: "" },
    source: { type: String, default: "direct" },
    utmSource: { type: String, default: "" },
    utmMedium: { type: String, default: "" },
    utmCampaign: { type: String, default: "" },

    // Page context
    pageUrl: { type: String, default: "" },
    screenResolution: { type: String, default: "" },
    language: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
cvDownloadSchema.index({ createdAt: -1 });
cvDownloadSchema.index({ action: 1, createdAt: -1 });
cvDownloadSchema.index({ country: 1, createdAt: -1 });
cvDownloadSchema.index({ city: 1, createdAt: -1 });
cvDownloadSchema.index({ ip: 1, action: 1 });

module.exports = mongoose.model("CvDownload", cvDownloadSchema);
