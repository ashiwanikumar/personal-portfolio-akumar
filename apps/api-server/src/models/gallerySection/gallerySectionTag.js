const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const Schema = mongoose.Schema;

const GallerySectionTagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    images: [
      {
        type: ObjectId,
        ref: "GallerySection",
      },
    ],
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to generate slug
GallerySectionTagSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

module.exports = mongoose.model("GallerySectionTag", GallerySectionTagSchema);
