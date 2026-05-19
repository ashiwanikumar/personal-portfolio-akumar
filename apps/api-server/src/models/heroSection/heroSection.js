const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const heroSectionSchema = new mongoose.Schema(
  {
    // Media field that can store both image and video URLs
    image: {
      type: String,
    },
    video: {
      type: String,
    },
    // Media type to distinguish between image and video
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    // File metadata
    fileSize: {
      type: Number,
    },
    fileName: {
      type: String,
    },
    mimeType: {
      type: String,
    },
    s3Key: {
      type: String,
    },
    cloudFrontUrl: {
      type: String,
    },
    titleCaption: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Button fields for CTA overlay
    buttonText: {
      type: String,
    },
    buttonLink: {
      type: String,
    },
    category: {
      ref: "HeroSectionCategory",
      type: ObjectId,
    },
    uploadedBy: {
      ref: "User",
      type: ObjectId,
    },
    publishedDate: {
      type: Date,
      default: Date.now(),
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    // Video-specific fields
    videoDuration: {
      type: Number, // Duration in seconds
    },
    videoThumbnail: {
      type: String, // URL to video thumbnail
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeroSection", heroSectionSchema);
