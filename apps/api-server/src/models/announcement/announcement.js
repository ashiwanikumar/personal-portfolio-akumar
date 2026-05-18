const mongoose = require("mongoose");

// Media file schema for rich media support
const mediaFileSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: false,
  },
  originalName: {
    type: String,
    required: false,
  },
  fileName: {
    type: String,
    required: false,
  },
  s3Key: {
    type: String,
    required: false,
  },
  s3Url: {
    type: String,
    required: false,
  },
  cloudFrontUrl: {
    type: String,
    required: false,
  },
  signedUrl: {
    type: String,
    required: false,
  },
  fileType: {
    type: String,
    enum: ["image", "video"],
    required: false,
  },
  mimeType: {
    type: String,
    required: false,
  },
  fileSize: {
    type: Number,
    required: false,
  },
  uploadPath: {
    type: String,
    required: false,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: false,
  },
  variants: {
    thumbnail: {
      type: String,
      required: false,
    },
    medium: {
      type: String,
      required: false,
    },
    large: {
      type: String,
      required: false,
    },
  },
  metadata: {
    width: {
      type: Number,
      required: false,
    },
    height: {
      type: Number,
      required: false,
    },
    duration: {
      type: Number,
      required: false, // For videos
    },
    format: {
      type: String,
      required: false,
    },
  },
  processingStatus: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  tags: [
    {
      type: String,
    },
  ],
  alt: {
    type: String,
    required: false,
  },
  caption: {
    type: String,
    required: false,
  },
});

const announcementSchema = new mongoose.Schema(
  {
    announcementType: {
      type: String,
      enum: ["sticky", "modal", "video"],
    },
    // Enhanced modalImage field - supports both string (backward compatibility) and rich media object
    modalImage: {
      type: mongoose.Schema.Types.Mixed, // Allows both String and Object
      validate: {
        validator: function (value) {
          // Allow null/undefined
          if (!value) return true;

          // Allow string (backward compatibility)
          if (typeof value === "string") return true;

          // Allow object with media file structure
          if (typeof value === "object") {
            // Basic validation for media object
            return true; // Additional validation can be added here
          }

          return false;
        },
        message: "modalImage must be a string URL or a media file object",
      },
    },
    // Additional media files for announcements (multiple files support)
    mediaFiles: [mediaFileSchema],
    message: {
      type: String,
    },
    startDate: {
      type: Date,
      default: Date.now(),
    },
    endDate: {
      type: Date,
      default: Date.now(),
    },
    approved: {
      type: Boolean,
    },
    hyperlink: {
      type: String,
    },
    targetPath: {
      type: String, // or [String] for multiple paths in the future
      required: false,
    },
    // SEO and accessibility enhancements
    title: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    tags: [
      {
        type: String,
      },
    ],
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    // Display settings
    displaySettings: {
      backgroundColor: {
        type: String,
        default: "#ffffff",
      },
      textColor: {
        type: String,
        default: "#000000",
      },
      position: {
        type: String,
        enum: ["top", "center", "bottom"],
        default: "center",
      },
      animation: {
        type: String,
        enum: ["none", "fade", "slide", "bounce"],
        default: "fade",
      },
      showCloseButton: {
        type: Boolean,
        default: true,
      },
      autoClose: {
        type: Boolean,
        default: false,
      },
      autoCloseDelay: {
        type: Number,
        default: 5000, // milliseconds
      },
    },
    // Targeting and scheduling
    targetAudience: {
      userRoles: [
        {
          type: String,
          enum: ["all", "guest", "member", "admin", "superadmin"],
          default: "all",
        },
      ],
      countries: [String],
      devices: [
        {
          type: String,
          enum: ["all", "desktop", "mobile", "tablet"],
          default: "all",
        },
      ],
    },
    // Analytics
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
      dismissals: {
        type: Number,
        default: 0,
      },
      lastViewed: {
        type: Date,
      },
    },
    // Approval workflow
    approvalDetails: {
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      approvedAt: {
        type: Date,
        required: false,
      },
      rejectionReason: {
        type: String,
        required: false,
      },
    },
    // Version control
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Add indexes for performance
    indexes: [
      { announcementType: 1 },
      { approved: 1 },
      { startDate: 1, endDate: 1 },
      { isActive: 1 },
      { createdAt: -1 },
    ],
  }
);

// Instance methods
announcementSchema.methods.isActiveNow = function () {
  const now = new Date();
  return (
    this.approved &&
    this.isActive &&
    this.startDate <= now &&
    this.endDate >= now
  );
};

announcementSchema.methods.incrementViews = function () {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

announcementSchema.methods.incrementClicks = function () {
  this.analytics.clicks += 1;
  return this.save();
};

announcementSchema.methods.incrementDismissals = function () {
  this.analytics.dismissals += 1;
  return this.save();
};

// Static methods
announcementSchema.statics.findActiveAnnouncements = function (
  announcementType = null
) {
  const now = new Date();
  const query = {
    approved: true,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  };

  if (announcementType) {
    query.announcementType = announcementType;
  }

  return this.find(query).sort({ priority: -1, createdAt: -1 }).exec();
};

announcementSchema.statics.findByTypeAndDateRange = function (
  type,
  startDate,
  endDate
) {
  return this.find({
    announcementType: type,
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      },
      {
        startDate: { $lte: startDate },
        endDate: { $gte: endDate },
      },
    ],
  }).exec();
};

// Pre-save middleware
announcementSchema.pre("save", function (next) {
  // Ensure end date is after start date
  if (this.endDate <= this.startDate) {
    const error = new Error("End date must be after start date");
    return next(error);
  }

  // Set approval details when approved status changes
  if (
    this.isModified("approved") &&
    this.approved &&
    !this.approvalDetails.approvedAt
  ) {
    this.approvalDetails.approvedAt = new Date();
  }

  next();
});

// Ensure indexes are created
announcementSchema.index({
  announcementType: 1,
  approved: 1,
  startDate: 1,
  endDate: 1,
});
announcementSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model("Announcement", announcementSchema);
