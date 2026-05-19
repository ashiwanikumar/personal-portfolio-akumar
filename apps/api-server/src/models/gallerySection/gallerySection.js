const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const gallerySectionSchema = new mongoose.Schema(
  {
    image: {
      type: String, // Main image URL (backward compatibility)
      required: function () {
        return this.mediaType !== "video"; // Only required for images
      },
    },
    // NEW: Media-specific fields for better video support
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    mediaUrl: {
      type: String, // Main media URL (image or video)
      required: true, // Always required for both images and videos
    },
    variants: {
      thumbnail: { type: String }, // Thumbnail image URL
      medium: { type: String }, // Medium size image URL
      large: { type: String }, // Large size image URL
    },
    fileId: {
      type: String, // Unique identifier for the file in S3
    },
    category: {
      ref: "GallerySectionCategory",
      type: ObjectId,
      required: true,
    },
    // NEW: State field for location-based organization
    state: {
      code: {
        type: String,
        trim: true,
        maxlength: 5,
      },
      name: {
        type: String,
        trim: true,
        maxlength: 100,
      },
    },
    uploadedBy: {
      ref: "User",
      type: ObjectId,
      required: true,
    },
    publishedDate: {
      type: Date,
      default: Date.now(),
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // NEW: Archive fields
    isArchived: {
      type: Boolean,
      default: false,
    },
    archiveDate: {
      type: Date,
    },
    archivedBy: {
      ref: "User",
      type: ObjectId,
    },
    archiveReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    archiveFolder: {
      type: String,
      enum: ["old-photos", "old-videos"], // Only valid values when set
      // No default - only set when actually archiving
    },
    // Archive approval fields
    approvedBy: {
      ref: "User",
      type: ObjectId,
    },
    approvedAt: {
      type: Date,
    },
    approvalComments: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    disapprovedBy: {
      ref: "User",
      type: ObjectId,
    },
    disapprovedAt: {
      type: Date,
    },
    disapprovalReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Enhanced SEO and metadata fields
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    },
    altText: {
      type: String,
      trim: true,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // SEO-specific fields
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    // Image metadata
    dimensions: {
      width: Number,
      height: Number,
    },
    fileSize: {
      type: Number,
    },
    format: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    // Social sharing metadata
    socialTitle: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    socialDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    socialImage: {
      type: String,
    },
  },
  { timestamps: true }
);

// Add indexed fields for better performance
gallerySectionSchema.index({ isApproved: 1 });
gallerySectionSchema.index({ category: 1 });
gallerySectionSchema.index({ tags: 1 });
gallerySectionSchema.index({ isFeatured: 1 });
gallerySectionSchema.index({ slug: 1 });
gallerySectionSchema.index({ mediaType: 1 }); // NEW: Index for media type
gallerySectionSchema.index({ "state.code": 1 }); // NEW: Index for state code
gallerySectionSchema.index({ "state.name": 1 }); // NEW: Index for state name
// NEW: Archive indexes
gallerySectionSchema.index({ isArchived: 1 });
gallerySectionSchema.index({ archiveFolder: 1 });
gallerySectionSchema.index({ archiveDate: 1 });
gallerySectionSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  altText: "text",
  seoTitle: "text",
  seoDescription: "text",
});

// Pre-save middleware to generate slug and set mediaUrl
gallerySectionSchema.pre("save", function (next) {
  // Always generate a unique slug to avoid duplicates
  const baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Add timestamp to make slug unique
  const timestamp = Date.now();
  this.slug = `${baseSlug}-${timestamp}`;

  // Set mediaUrl to image if not provided (backward compatibility)
  if (!this.mediaUrl) {
    this.mediaUrl = this.image;
  }

  // Determine mediaType based on file extension if not set
  if (!this.mediaType) {
    const url = this.mediaUrl || this.image;
    if (url) {
      const extension = url.split(".").pop()?.toLowerCase();
      const videoExtensions = ["mp4", "webm", "ogg", "avi", "mov", "quicktime"];
      this.mediaType = videoExtensions.includes(extension) ? "video" : "image";
    }
  }

  // NEW: Set archive folder based on media type if archived
  if (this.isArchived && !this.archiveFolder) {
    this.archiveFolder =
      this.mediaType === "video" ? "old-videos" : "old-photos";
  }

  // NEW: Set archive date if being archived
  if (this.isArchived && !this.archiveDate) {
    this.archiveDate = new Date();
  }

  next();
});

module.exports = mongoose.model("GallerySection", gallerySectionSchema);
