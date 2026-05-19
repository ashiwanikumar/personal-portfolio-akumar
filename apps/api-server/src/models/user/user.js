const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    picture: {
      type: Array,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    // New S3-based profile picture system
    profilePicture: {
      url: {
        type: String,
        trim: true,
        // CloudFront signed URL
      },
      cloudFrontUrl: {
        type: String,
        trim: true,
        // CloudFront public URL
      },
      s3Url: {
        type: String,
        trim: true,
        // Direct S3 URL
      },
      s3Key: {
        type: String,
        trim: true,
        index: true,
        // S3 object key for deletion/management
      },
      originalName: {
        type: String,
        trim: true,
        // Original filename
      },
      originalSize: {
        type: Number,
        // Original file size in bytes
      },
      processedSize: {
        type: Number,
        // Processed file size in bytes after compression/resize
      },
      mimetype: {
        type: String,
        trim: true,
        default: "image/jpeg",
        // File MIME type
      },
      dimensions: {
        type: String,
        default: "800x800",
        // Image dimensions
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
        // When the profile picture was uploaded
      },
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
    },
    accountType: {
      type: String,
      default: "local",
      enum: ["local", "google", "invitation"],
    },
    // Enhanced Role System - Reference to Role model
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: false, // Temporarily optional for migration
      index: true,
    },
    // Legacy role field for backward compatibility
    role: {
      type: String,
    },
    // Role assignment tracking
    roleAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    roleAssignedAt: {
      type: Date,
      default: Date.now,
    },
    // Account activation fields
    activated: {
      type: Boolean,
      default: false,
    },
    activationToken: {
      type: String,
    },
    activationTokenSentAt: {
      type: Date,
    },
    activatedAt: {
      type: Date,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    // Account status
    disabled: {
      type: Boolean,
      default: false,
    },
    // Invitation tracking
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invitedAt: {
      type: Date,
    },
    invitationAcceptedAt: {
      type: Date,
    },
    // Additional user metadata
    department: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    // Profile description/bio
    intro: {
      type: String,
      trim: true,
      maxlength: [2000, "Introduction cannot exceed 2000 characters"],
    },
    // MFA (Two-Factor Authentication) fields
    mfa: {
      enabled: {
        type: Boolean,
        default: false,
        index: true,
      },
      secret: {
        type: String,
        select: false, // Never include in queries by default
      },
      backupCodes: [{
        code: {
          type: String,
          select: false, // Never include in queries by default
        },
        used: {
          type: Boolean,
          default: false,
        },
        usedAt: {
          type: Date,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }],
      enabledAt: {
        type: Date,
      },
      lastUsedAt: {
        type: Date,
      },
      // Admin control - can be disabled by super admin
      enforced: {
        type: Boolean,
        default: false,
      },
      // For recovery purposes
      recoveryEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    // User preferences
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      language: {
        type: String,
        default: "en",
        enum: ["en", "hi"],
      },
    },
    // Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ roleId: 1 });
userSchema.index({ activated: 1 });
userSchema.index({ disabled: 1 });
userSchema.index({ invitedBy: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActive: -1 });
userSchema.index({ "profilePicture.s3Key": 1 });
userSchema.index({ "profilePicture.uploadedAt": -1 });
userSchema.index({ "mfa.enabled": 1 });
userSchema.index({ "mfa.enforced": 1 });
userSchema.index({ "mfa.enabledAt": -1 });
userSchema.index({ "mfa.lastUsedAt": -1 });

// Virtual for role information
userSchema.virtual("roleInfo", {
  ref: "Role",
  localField: "roleId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for invitation status
userSchema.virtual("invitationStatus").get(function () {
  if (this.accountType === "invitation") {
    if (this.invitationAcceptedAt) return "accepted";
    if (this.invitedAt) return "pending";
    return "sent";
  }
  return "not_applicable";
});

// Pre-save middleware to update lastActive
userSchema.pre("save", function (next) {
  if (this.isModified("lastActive") || this.isNew) {
    this.lastActive = new Date();
  }
  next();
});

// Generate JWT token with role information
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role, // Legacy role
      roleId: this.roleId, // New role system
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE || "30d",
    }
  );
};

// Check if user has a specific permission
userSchema.methods.hasPermission = function (resource, permission) {
  if (!this.roleInfo) return false;
  return this.roleInfo.hasPermission(resource, permission);
};

// Get user's complete permissions
userSchema.methods.getPermissions = function () {
  if (!this.roleInfo) return {};
  
  const permissions = {};
  this.roleInfo.accessRights.forEach((right) => {
    permissions[right.resource] = right.permissions;
  });
  
  return permissions;
};

// Check if user can assign roles (has hierarchy level)
userSchema.methods.canAssignRole = function (targetRoleHierarchy) {
  if (!this.roleInfo) return false;
  return this.roleInfo.hierarchyLevel < targetRoleHierarchy;
};

// MFA-related methods
userSchema.methods.isMFAEnabled = function () {
  return this.mfa && this.mfa.enabled === true;
};

userSchema.methods.isMFAEnforced = function () {
  return this.mfa && this.mfa.enforced === true;
};

userSchema.methods.canDisableMFA = function () {
  // Users can disable MFA unless it's enforced by admin
  return !this.isMFAEnforced();
};

userSchema.methods.getValidBackupCodes = function () {
  if (!this.mfa || !this.mfa.backupCodes) return [];
  return this.mfa.backupCodes.filter(code => !code.used);
};

userSchema.methods.hasValidBackupCodes = function () {
  return this.getValidBackupCodes().length > 0;
};

// Enhanced client object with role information
userSchema.statics.toClientObject = function (user) {
  const userObject = user?.toObject();

  const clientObject = {
    _id: userObject._id,
    email: userObject.email,
    name: userObject.name,
    role: userObject.role, // Legacy
    roleId: userObject.roleId,
    roleInfo: userObject.roleInfo,
    activated: userObject.activated,
    disabled: userObject.disabled,
    department: userObject.department,
    jobTitle: userObject.jobTitle,
    phone: userObject.phone,
    intro: userObject.intro,
    invitationStatus: userObject.invitationStatus,
    lastActive: userObject.lastActive,
    createdAt: userObject.createdAt,
    updatedAt: userObject.updatedAt,
    // MFA status (without sensitive data)
    mfaEnabled: userObject.mfa?.enabled || false,
    mfaEnforced: userObject.mfa?.enforced || false,
    mfaEnabledAt: userObject.mfa?.enabledAt,
    mfaLastUsedAt: userObject.mfa?.lastUsedAt,
    hasBackupCodes: userObject.mfa?.backupCodes?.some(code => !code.used) || false,
  };

  return clientObject;
};

// Static method to find users by role
userSchema.statics.findByRole = function (roleId, options = {}) {
  const { page = 1, limit = 10, includeDisabled = false } = options;
  
  const query = { roleId };
  if (!includeDisabled) {
    query.disabled = false;
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .populate("roleId", "name description hierarchyLevel")
    .populate("invitedBy", "name email")
    .populate("roleAssignedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to find users with active invitations
userSchema.statics.findPendingInvitations = function (options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  
  return this.find({
    accountType: "invitation",
    invitationAcceptedAt: { $exists: false },
    activated: false,
  })
    .populate("roleId", "name description")
    .populate("invitedBy", "name email")
    .sort({ invitedAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model("User", userSchema);
