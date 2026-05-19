// ** LIBS ** //
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const marketingAdminSchema = new mongoose.Schema(
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
    // List of blogs
    blogs: [
      {
        type: ObjectId,
        ref: "Blog",
      },
    ],
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

module.exports = mongoose.model("MarketingAdmin", marketingAdminSchema);
