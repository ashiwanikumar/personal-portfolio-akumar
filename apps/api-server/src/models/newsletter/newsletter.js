// ** LIBS ** //
const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    // Basic Contact Information
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
      index: true, // For SMS notifications
    },

    // Personal Information
    name: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
    },

    // Location Information (Critical for agriculture)
    location: {
      state: {
        type: String,
        required: true,
        index: true,
      },
      district: {
        type: String,
        required: true,
        index: true,
      },
      tehsil: { type: String, trim: true },
      village: { type: String, trim: true },
      pincode: { type: String, trim: true, index: true },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },

    // Farmer Profile (for targeted content)
    farmerProfile: {
      farmerType: {
        type: String,
        enum: [
          "small",
          "marginal",
          "medium",
          "large",
          "landless",
          "sharecropper",
        ],
        index: true,
      },
      landSize: {
        type: Number, // in acres
        min: 0,
      },
      crops: [
        {
          name: { type: String, trim: true },
          season: {
            type: String,
            enum: ["kharif", "rabi", "zaid", "perennial"],
          },
          area: { type: Number }, // in acres
        },
      ],
      livestock: [
        {
          type: {
            type: String,
            enum: [
              "cattle",
              "buffalo",
              "goat",
              "sheep",
              "poultry",
              "pig",
              "other",
            ],
          },
          count: { type: Number, min: 0 },
        },
      ],
      irrigationMethod: {
        type: String,
        enum: ["rainfed", "drip", "sprinkler", "flood", "mixed"],
      },
      hasKisanCreditCard: { type: Boolean, default: false },
      pmKisanBeneficiary: { type: Boolean, default: false },
    },

    // Enhanced Preferences (Agriculture-specific)
    preferences: {
      // Government Schemes & Policies
      policyUpdates: { type: Boolean, default: true },
      schemeNotifications: { type: Boolean, default: true },
      subsidyAlerts: { type: Boolean, default: true },

      // Agricultural Information
      cropAdvisory: { type: Boolean, default: true },
      weatherAlerts: { type: Boolean, default: true },
      marketPrices: { type: Boolean, default: true },
      seasonalGuidance: { type: Boolean, default: true },

      // Technology & Training
      modernTechniques: { type: Boolean, default: false },
      trainingPrograms: { type: Boolean, default: false },
      digitalizationUpdates: { type: Boolean, default: false },

      // Emergency Communications
      emergencyAlerts: { type: Boolean, default: true },
      disasterManagement: { type: Boolean, default: true },
      pestDiseaseAlerts: { type: Boolean, default: true },
    },

    // Communication Preferences
    communicationPrefs: {
      emailFrequency: {
        type: String,
        enum: ["immediate", "daily", "weekly", "monthly"],
        default: "weekly",
      },
      smsEnabled: { type: Boolean, default: false },
      language: {
        type: String,
        enum: [
          "hindi",
          "english",
          "bengali",
          "telugu",
          "marathi",
          "tamil",
          "gujarati",
          "urdu",
          "kannada",
          "malayalam",
          "punjabi",
          "assamese",
          "oriya",
        ],
        default: "hindi",
      },
      contentFormat: {
        type: String,
        enum: ["text", "audio", "video", "mixed"],
        default: "text",
      },
    },

    // Verification & Compliance
    verification: {
      emailConfirmed: { type: Boolean, default: false },
      phoneConfirmed: { type: Boolean, default: false },
      aadhaarNumber: {
        type: String,
        sparse: true,
        index: true,
      }, // For government verification
      aadhaarVerified: { type: Boolean, default: false },
      consentDate: { type: Date, default: Date.now },
      dataProcessingConsent: { type: Boolean, default: false },
    },

    // System Fields
    status: {
      type: String,
      enum: ["active", "inactive", "unsubscribed", "bounced", "suspended"],
      default: "active",
      index: true,
    },

    // Communication Tracking
    communications: {
      lastEmailSent: { type: Date },
      lastSmsSent: { type: Date },
      emailOpenCount: { type: Number, default: 0 },
      emailClickCount: { type: Number, default: 0 },
      smsDeliveryCount: { type: Number, default: 0 },
      totalCommunications: { type: Number, default: 0 },
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

    // Administrative Fields
    admin: {
      source: {
        type: String,
        enum: [
          "website",
          "mobile_app",
          "offline_registration",
          "government_database",
          "partner_organization",
        ],
        default: "website",
      },
      registeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      notes: [
        {
          text: String,
          addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          addedAt: { type: Date, default: Date.now },
        },
      ],
      tags: [{ type: String, trim: true }],
    },

    // Tokens
    confirmationToken: { type: String },
    unsubscribeToken: { type: String },
    unsubscribedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Enhanced Indexes for Agriculture Use Cases
newsletterSchema.index({ status: 1, "communicationPrefs.emailFrequency": 1 });
newsletterSchema.index({ "location.state": 1, "location.district": 1 });
newsletterSchema.index({
  "farmerProfile.farmerType": 1,
  "farmerProfile.crops.name": 1,
});
newsletterSchema.index({ "communicationPrefs.language": 1 });
newsletterSchema.index({
  "verification.aadhaarVerified": 1,
  "verification.emailConfirmed": 1,
});
newsletterSchema.index({
  "technicalInfo.location.country": 1,
  "technicalInfo.location.city": 1,
});
newsletterSchema.index({ "technicalInfo.ip.ipv4": 1 });
newsletterSchema.index({
  "technicalInfo.location.countryCode": 1,
  "technicalInfo.location.region": 1,
});
newsletterSchema.index({ "technicalInfo.network.asn": 1 });
newsletterSchema.index({ "technicalInfo.metadata.collectedAt": 1 });

// Method to unsubscribe a user with reason tracking
newsletterSchema.methods.unsubscribe = function (reason = null) {
  this.status = "unsubscribed";
  this.unsubscribedAt = new Date();
  if (reason) {
    this.admin.notes.push({
      text: `Unsubscribed: ${reason}`,
      addedAt: new Date(),
    });
  }
  return this.save();
};

// Method to update preferences with validation
newsletterSchema.methods.updatePreferences = function (newPreferences) {
  if (newPreferences) {
    this.preferences = { ...this.preferences.toObject(), ...newPreferences };
  }
  return this.save();
};

// Method to update communication preferences
newsletterSchema.methods.updateCommunicationPreferences = function (
  newCommPrefs
) {
  if (newCommPrefs) {
    this.communicationPrefs = {
      ...this.communicationPrefs.toObject(),
      ...newCommPrefs,
    };
  }
  return this.save();
};

// Method to update farmer profile
newsletterSchema.methods.updateFarmerProfile = function (profileData) {
  if (profileData) {
    this.farmerProfile = { ...this.farmerProfile.toObject(), ...profileData };
  }
  return this.save();
};

// Method to track communication
newsletterSchema.methods.trackCommunication = function (type, success = true) {
  const now = new Date();

  if (type === "email" && success) {
    this.communications.lastEmailSent = now;
  } else if (type === "sms" && success) {
    this.communications.lastSmsSent = now;
    this.communications.smsDeliveryCount += 1;
  }

  if (success) {
    this.communications.totalCommunications += 1;
  }

  return this.save();
};

// Method to verify contact information
newsletterSchema.methods.verifyContact = function (type, verified = true) {
  if (type === "email") {
    this.verification.emailConfirmed = verified;
  } else if (type === "phone") {
    this.verification.phoneConfirmed = verified;
  } else if (type === "aadhaar") {
    this.verification.aadhaarVerified = verified;
  }
  return this.save();
};

// Static method to find farmers by crop and location
newsletterSchema.statics.findByLocationAndCrop = function (
  state,
  district,
  cropName
) {
  return this.find({
    "location.state": state,
    "location.district": district,
    "farmerProfile.crops.name": new RegExp(cropName, "i"),
    status: "active",
  });
};

// Static method to find farmers eligible for specific schemes
newsletterSchema.statics.findEligibleForSchemes = function (schemeType) {
  const query = { status: "active" };

  if (schemeType === "pmkisan") {
    query["farmerProfile.pmKisanBeneficiary"] = false; // Not yet beneficiary
    query["farmerProfile.farmerType"] = { $in: ["small", "marginal"] };
  } else if (schemeType === "kcc") {
    query["farmerProfile.hasKisanCreditCard"] = false;
  }

  return this.find(query);
};

// Virtual for full name
newsletterSchema.virtual("fullName").get(function () {
  if (this.name && this.name.firstName) {
    return `${this.name.firstName} ${this.name.lastName || ""}`.trim();
  }
  return this.email.split("@")[0]; // Fallback to email username
});

// Virtual for total land area
newsletterSchema.virtual("totalLandArea").get(function () {
  if (this.farmerProfile && this.farmerProfile.crops) {
    return this.farmerProfile.crops.reduce(
      (total, crop) => total + (crop.area || 0),
      0
    );
  }
  return this.farmerProfile?.landSize || 0;
});

// Pre-save middleware for data validation and processing
newsletterSchema.pre("save", function (next) {
  // Generate unsubscribe token if not exists
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = require("crypto").randomBytes(32).toString("hex");
  }

  // Validate phone number format (Indian mobile numbers)
  if (this.phone && !/^[6-9]\d{9}$/.test(this.phone)) {
    const error = new Error("Invalid Indian mobile number format");
    return next(error);
  }

  // Validate Aadhaar number format
  if (
    this.verification.aadhaarNumber &&
    !/^\d{12}$/.test(this.verification.aadhaarNumber)
  ) {
    const error = new Error("Invalid Aadhaar number format");
    return next(error);
  }

  next();
});

module.exports = mongoose.model("NewsletterSubscriber", newsletterSchema);
