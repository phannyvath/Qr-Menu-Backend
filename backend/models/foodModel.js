const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    foodName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imgUrl: { type: String, required: true },
    webID: { type: Number, required: true }, // Replaced ownerID with webID
  },
  {
    timestamps: true,
  }
);

const Food = mongoose.model("Food", foodSchema);
module.exports = Food;
