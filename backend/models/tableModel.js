const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tableId: { type: String, required: true, unique: true }, // e.g., "1", "2"
  // status can be any string, like 'VIP', 'Busy', 'Reserved'
    status: { type: String, default: "normal" },
  people: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Table", tableSchema);
