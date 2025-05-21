const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    webID: {
      type: String, // or Number based on your usage
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ categoryName: 1, webID: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
