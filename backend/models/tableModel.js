const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tableId: { type: String, required: true, unique: true }, // e.g., "1", "2"
  status: { type: String, enum: ["normal", "vip"], default: "normal" },
  people: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Table", tableSchema);
