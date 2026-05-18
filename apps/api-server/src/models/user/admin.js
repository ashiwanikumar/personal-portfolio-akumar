// ** LIBS ** //
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const adminSchema = new mongoose.Schema(
  {
    // ** ------ User Details ------  ** //
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
    // Disabled
    disabled: {
      type: Boolean,
      default: false,
    },
    // ** ------ Team ------  ** //
    invitations: [
      {
        email: {
          type: String,
          lowercase: true,
        },
        role: {
          type: String,
          enum: ["agent", "admin"],
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
      },
    ],
    // List of team members
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

module.exports = mongoose.model("Admin", adminSchema);
