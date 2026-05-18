const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const Schema = mongoose.Schema;

const HeroCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  heroes: [
    {
      type: ObjectId,
      ref: "HeroSection",
    },
  ],
});

module.exports = mongoose.model("HeroSectionCategory", HeroCategorySchema);
