// models/Feature.js
const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema(
  {
    jobFeature: {
      imageUrl: { type: String, required: true },
      description: { type: String, required: true },
      applyLink: { type: String, required: true },
    },
    supplierFeature: {
      imageUrl: { type: String, required: true },
      description: { type: String, required: true },
      applyLink: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feature", featureSchema);
