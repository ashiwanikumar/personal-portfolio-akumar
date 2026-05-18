const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const Schema = mongoose.Schema;

const HeroCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  images: [
    {
      type: ObjectId,
      ref: "HeroImage",
    },
  ],
});

module.exports = mongoose.model("HeroImageCategory", HeroCategorySchema);
