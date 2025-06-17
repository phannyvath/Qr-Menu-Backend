const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tableId: {
    type: Number,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    default: "normal", // can be "normal" or "VIP"
  },
  status: {
    type: String,
    default: "available", // can be "Busy" or "Free"
  },
  people: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Table", tableSchema);
