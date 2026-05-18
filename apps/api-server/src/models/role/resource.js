const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Resource name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Resource name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    // Available permissions for this resource
    availablePermissions: {
      read: {
        type: Boolean,
        default: true,
        description: "View/read access to the resource",
      },
      write: {
        type: Boolean,
        default: true,
        description: "Create/update access to the resource",
      },
      delete: {
        type: Boolean,
        default: false,
        description: "Delete access to the resource",
      },
      approve: {
        type: Boolean,
        default: false,
        description: "Approve/reject actions for the resource",
      },
    },
    // Resource category for grouping
    category: {
      type: String,
      required: true,
      enum: [
        "content",
        "user-management",
        "analytics",
        "communications",
        "system",
        "marketing",
        "community",
        "citizen-services",
      ],
      default: "content",
    },
    // Resource status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Resource priority for display order
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
    // Icon or identifier for UI
    icon: {
      type: String,
      trim: true,
    },
    // API endpoints associated with this resource
    endpoints: [
      {
        method: {
          type: String,
          enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
          required: true,
        },
        path: {
          type: String,
          required: true,
        },
        description: String,
      },
    ],
    // Created by reference
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes for better performance
resourceSchema.index({ name: 1 });
resourceSchema.index({ slug: 1 });
resourceSchema.index({ category: 1 });
resourceSchema.index({ isActive: 1 });
resourceSchema.index({ priority: 1 });

// Pre-save middleware to generate slug
resourceSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }
  next();
});

// Virtual for total available permissions
resourceSchema.virtual("totalAvailablePermissions").get(function () {
  return Object.values(this.availablePermissions).filter(Boolean).length;
});

// Instance method to check if permission is available
resourceSchema.methods.hasPermission = function (permission) {
  return this.availablePermissions[permission] || false;
};

// Instance method to get available permissions list
resourceSchema.methods.getAvailablePermissions = function () {
  return Object.keys(this.availablePermissions).filter(
    (permission) => this.availablePermissions[permission]
  );
};

// Static method to find active resources
resourceSchema.statics.findActiveResources = function () {
  return this.find({ isActive: true }).sort({ priority: 1, name: 1 });
};

// Static method to find resources by category
resourceSchema.statics.findByCategory = function (category) {
  return this.find({ category, isActive: true }).sort({ priority: 1, name: 1 });
};

// Static method to get all categories
resourceSchema.statics.getCategories = function () {
  return this.distinct("category");
};

module.exports = mongoose.model("Resource", resourceSchema);
