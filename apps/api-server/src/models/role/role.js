const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Rolename cannot exceed 50 characters"],
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
    // Array of access rights, each access right will contain a resource and an array of permissions
    accessRights: [
      {
        resource: {
          type: String,
          required: true,
          trim: true,
        },
        permissions: {
          read: {
            type: Boolean,
            default: false,
          },
          write: {
            type: Boolean,
            default: false,
          },
          delete: {
            type: Boolean,
            default: false,
          },
          approve: {
            type: Boolean,
            default: false,
          },
        },
      },
    ],
    // Approval rights for general actions
    approvalRights: {
      type: Boolean,
      default: false,
    },
    // Role status
    isActive: {
      type: Boolean,
      default: true,
    },
    // System role flag (cannot be deleted/modified)
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    // Created by reference
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () { return !this.isSystemRole; },
    },
    // Role hierarchy level
    hierarchyLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
roleSchema.index({ name: 1 });
roleSchema.index({ slug: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ createdBy: 1 });

// Pre-save middleware to generate slug
roleSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }
  next();
});

// Virtual for total permissions count
roleSchema.virtual("totalPermissions").get(function () {
  return this.accessRights.reduce((total, right) => {
    return total + Object.values(right.permissions).filter(Boolean).length;
  }, 0);
});

// Instance method to check if role has permission
roleSchema.methods.hasPermission = function (resource, permission) {
  const accessRight = this.accessRights.find(
    (right) => right.resource === resource
  );
  if (!accessRight) return false;

  return accessRight.permissions[permission] || false;
};

// Instance method to get all permissions for a resource
roleSchema.methods.getResourcePermissions = function (resource) {
  const accessRight = this.accessRights.find(
    (right) => right.resource === resource
  );
  return accessRight ? accessRight.permissions : null;
};

// Static method to find active roles
roleSchema.statics.findActiveRoles = function () {
  return this.find({ isActive: true }).sort({ hierarchyLevel: 1, name: 1 });
};

// Static method to find non-system roles
roleSchema.statics.findNonSystemRoles = function () {
  return this.find({ isSystemRole: false }).sort({ name: 1 });
};

module.exports = mongoose.model("Role", roleSchema);
