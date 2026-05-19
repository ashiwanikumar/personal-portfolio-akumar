const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const Schema = mongoose.Schema;

const GallerySectionCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    images: [
      {
        type: ObjectId,
        ref: "GallerySection",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "GallerySectionCategory",
  GallerySectionCategorySchema
);
