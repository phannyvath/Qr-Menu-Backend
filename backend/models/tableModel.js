const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  status: { type: String, default: "normal" }, // e.g., "VIP", "Busy", etc.
  people: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Table", tableSchema);
