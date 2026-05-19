const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const superAdminSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    // ---------- Team ----------
    // Team invites
    invitations: [
      {
        email: {
          type: String,
          lowercase: true,
        },
        role: {
          type: String,
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        date: {
          type: Date,
          default: Date.now,
        },
        invitedBy: {
          userId: {
            type: ObjectId,
            ref: "User",
          },
          name: {
            type: String,
          },
          email: {
            type: String,
          },
          role: {
            type: String,
          },
        },
      },
    ],
    // Team members
    team: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
    // Invited by
    invitedBy: {
      type: ObjectId,
      ref: "SuperAdmin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SuperAdmin", superAdminSchema);
