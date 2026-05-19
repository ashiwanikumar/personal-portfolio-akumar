// ** LIBS ** //
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      default: "v1",
    },
    title: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    // Media field for videos/additional images
    media: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
        originalName: String,
        size: Number,
        mimeType: String,
        s3Key: String,
        cloudFrontUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // SEO fields
    description: {
      type: String,
      required: true,
    },
    // Content Structure looks like: { blocks: [], entityMap: {} } DraftJS
    content: {
      type: Object,
      required: true,
    },
    isMarkdown: {
      type: Boolean,
      default: false,
    },
    author: {
      ref: "User",
      type: ObjectId,
    },
    publishedDate: {
      type: Date,
      default: Date.now(),
    },
    category: {
      type: ObjectId,
      ref: "BlogCategory",
    },
    tags: [
      {
        type: ObjectId,
        ref: "BlogTag",
      },
    ],
    approved: {
      type: Boolean,
      default: false,
    },
    // Blog status field
    status: {
      type: String,
      enum: ["draft", "published", "scheduled", "archived"],
      default: "draft",
      index: true,
    },
    // Scheduling fields
    scheduledAt: {
      type: Date,
      default: null,
      index: true,
    },
    publishAt: {
      type: Date,
      default: null,
      index: true,
    },
    unpublishAt: {
      type: Date,
      default: null,
      index: true,
    },
    isScheduled: {
      type: Boolean,
      default: false,
      index: true,
    },
    scheduleType: {
      type: String,
      enum: ["once", "recurring", "conditional"],
      default: "once",
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
      },
      interval: {
        type: Number,
        min: 1,
        default: 1,
      },
      daysOfWeek: [
        {
          type: Number,
          min: 0,
          max: 6,
        },
      ],
      dayOfMonth: {
        type: Number,
        min: 1,
        max: 31,
      },
      endDate: Date,
    },
    schedulerMetadata: {
      createdBy: {
        type: ObjectId,
        ref: "User",
      },
      lastExecutedAt: Date,
      nextExecutionAt: Date,
      executionCount: {
        type: Number,
        default: 0,
      },
      isProcessing: {
        type: Boolean,
        default: false,
        index: true,
      },
      processingStartedAt: Date,
      executionHistory: [
        {
          executedAt: {
            type: Date,
            default: Date.now,
          },
          status: {
            type: String,
            enum: ["success", "failed", "skipped"],
          },
          error: String,
          result: mongoose.Schema.Types.Mixed,
        },
      ],
    },
    // Conditional publishing rules
    conditionalRules: {
      minViews: Number,
      requiredApproval: Boolean,
      contentValidation: Boolean,
      seoScore: {
        min: Number,
        max: Number,
      },
    },
    // Featured flag
    featured: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Add pre-save hook for slug generation
blogSchema.pre("validate", async function (next) {
  if (!this.slug && this.title) {
    // Basic slugify: lower, replace spaces, remove non-alphanum
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    let slug = baseSlug;
    let count = 1;
    // Ensure uniqueness
    while (await mongoose.models.Blog.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
