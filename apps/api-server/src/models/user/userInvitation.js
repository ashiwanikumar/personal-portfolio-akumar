const mongoose = require("mongoose");
const crypto = require("crypto");

const userInvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    // Role to be assigned
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role is required"],
      index: true,
    },
    // Invitation details
    invitationToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    invitationUrl: {
      type: String,
      required: true,
    },
    // Who sent the invitation
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Invitation status tracking
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "cancelled", "resent"],
      default: "pending",
      index: true,
    },
    // Timing fields
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    acceptedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    // User creation tracking
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Additional user details
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
    // Invitation message
    personalMessage: {
      type: String,
      trim: true,
      maxlength: [500, "Personal message cannot exceed 500 characters"],
    },
    // Email tracking
    emailsSent: {
      type: Number,
      default: 1,
    },
    lastEmailSentAt: {
      type: Date,
      default: Date.now,
    },
    // Metadata
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    // Audit fields
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
userInvitationSchema.index({ email: 1, status: 1 });
userInvitationSchema.index({ invitedBy: 1, status: 1 });
userInvitationSchema.index({ roleId: 1 });
userInvitationSchema.index({ expiresAt: 1 });
userInvitationSchema.index({ sentAt: -1 });

// Virtual for role information
userInvitationSchema.virtual("roleInfo", {
  ref: "Role",
  localField: "roleId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for inviter information
userInvitationSchema.virtual("inviterInfo", {
  ref: "User",
  localField: "invitedBy",
  foreignField: "_id",
  justOne: true,
});

// Virtual for checking if invitation is expired
userInvitationSchema.virtual("isExpired").get(function () {
  return this.expiresAt < new Date() || this.status === "expired";
});

// Virtual for time remaining
userInvitationSchema.virtual("timeRemaining").get(function () {
  if (this.isExpired) return 0;
  return Math.max(0, this.expiresAt.getTime() - Date.now());
});

// Pre-save middleware to generate invitation token
userInvitationSchema.pre("save", function (next) {
  if (this.isNew) {
    // Generate secure invitation token
    this.invitationToken = crypto.randomBytes(32).toString("hex");

    // Generate invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
    this.invitationUrl = `${baseUrl}/accept-invitation?token=${this.invitationToken}`;

    // Set expiration date (7 days from now)
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Instance method to check if invitation is valid
userInvitationSchema.methods.isValid = function () {
  return (
    this.status === "pending" && this.expiresAt > new Date() && !this.acceptedAt
  );
};

// Instance method to mark invitation as accepted
userInvitationSchema.methods.markAsAccepted = function (userId) {
  this.status = "accepted";
  this.acceptedAt = new Date();
  this.userId = userId;
  return this.save();
};

// Instance method to cancel invitation
userInvitationSchema.methods.cancel = function () {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  return this.save();
};

// Instance method to extend expiration
userInvitationSchema.methods.extend = function (days = 7) {
  this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  this.status = "pending";
  return this.save();
};

// Instance method to resend invitation
userInvitationSchema.methods.resend = function () {
  this.emailsSent += 1;
  this.lastEmailSentAt = new Date();
  this.status = "resent";

  // Extend expiration by 7 days
  this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return this.save();
};

// Static method to find pending invitations
userInvitationSchema.statics.findPending = function (options = {}) {
  const { page = 1, limit = 10, roleId, invitedBy } = options;
  const skip = (page - 1) * limit;

  const query = {
    status: "pending",
    expiresAt: { $gt: new Date() },
  };

  if (roleId) query.roleId = roleId;
  if (invitedBy) query.invitedBy = invitedBy;

  return this.find(query)
    .populate("roleInfo", "name description hierarchyLevel")
    .populate("inviterInfo", "name email")
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to find expired invitations
userInvitationSchema.statics.findExpired = function () {
  return this.find({
    status: "pending",
    expiresAt: { $lt: new Date() },
  });
};

// Static method to find invitation by token
userInvitationSchema.statics.findByToken = function (token) {
  return this.findOne({
    invitationToken: token,
    status: "pending",
    expiresAt: { $gt: new Date() },
  }).populate("roleInfo", "name description hierarchyLevel accessRights");
};

// Static method to cleanup expired invitations
userInvitationSchema.statics.cleanupExpired = function () {
  return this.updateMany(
    {
      status: "pending",
      expiresAt: { $lt: new Date() },
    },
    {
      status: "expired",
    }
  );
};

// Static method to get invitation statistics
userInvitationSchema.statics.getStats = function (options = {}) {
  const { startDate, endDate, invitedBy, roleId } = options;

  const matchStage = {};
  if (startDate) matchStage.sentAt = { $gte: new Date(startDate) };
  if (endDate) {
    matchStage.sentAt = { ...matchStage.sentAt, $lte: new Date(endDate) };
  }
  if (invitedBy) matchStage.invitedBy = new mongoose.Types.ObjectId(invitedBy);
  if (roleId) matchStage.roleId = new mongoose.Types.ObjectId(roleId);

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalInvitations: { $sum: 1 },
        pendingInvitations: {
          $sum: {
            $cond: { if: { $eq: ["$status", "pending"] }, then: 1, else: 0 },
          },
        },
        acceptedInvitations: {
          $sum: {
            $cond: { if: { $eq: ["$status", "accepted"] }, then: 1, else: 0 },
          },
        },
        expiredInvitations: {
          $sum: {
            $cond: { if: { $eq: ["$status", "expired"] }, then: 1, else: 0 },
          },
        },
        cancelledInvitations: {
          $sum: {
            $cond: { if: { $eq: ["$status", "cancelled"] }, then: 1, else: 0 },
          },
        },
        averageAcceptanceTime: {
          $avg: {
            $cond: {
              if: { $eq: ["$status", "accepted"] },
              then: { $subtract: ["$acceptedAt", "$sentAt"] },
              else: null,
            },
          },
        },
      },
    },
  ]);
};

module.exports = mongoose.model("UserInvitation", userInvitationSchema);
