// ** LIBS ** //
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    user: {
      type: ObjectId,
      ref: "User",
    },
    // Invited by
    invitedBy: {
      type: ObjectId,
      ref: "Admin",
    },
    role: {
      type: String,
      enum: ["admin"],
    },
    // ------ Subscription ------
    currentPlan: {
      type: String,
      default: "Free",
    },
    subscription: {
      type: ObjectId,
      ref: "Subscription",
    },
    subscriptionStatus: {
      type: String,
    },
    // List of team members
    team: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
    // Notifications
    notifications: [
      {
        type: ObjectId,
        ref: "Notification",
      },
    ],
    // Disabled
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
