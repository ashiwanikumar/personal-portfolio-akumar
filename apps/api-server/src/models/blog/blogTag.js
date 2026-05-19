// ** LIBS ** //
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const blogTagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#6c757d",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Array of blogs
    blogs: [
      {
        type: ObjectId,
        ref: "Blog",
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to generate slug from name if not provided
blogTagSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

// Pre-update hook to generate slug during updates
blogTagSchema.pre(['findOneAndUpdate', 'updateOne'], function(next) {
  const update = this.getUpdate();
  
  if (update.name && !update.slug) {
    update.slug = update.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  
  next();
});

module.exports = mongoose.model("BlogTag", blogTagSchema);
