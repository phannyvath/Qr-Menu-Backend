const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String },
    webID: { type: Number, required: true, unique: true }, // Add webID here
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("User", userSchema);
