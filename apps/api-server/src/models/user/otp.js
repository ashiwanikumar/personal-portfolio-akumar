const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otp: { type: String, required: true, maxlength: 128 }, // SHA256 hash
    purpose: { type: String, default: "admin_login" },
    expiresAt: { type: Date, required: true, index: true },
    isVerified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

// Auto-delete expired OTPs after 1 hour
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model("Otp", otpSchema);
