const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  webID: { type: String, required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table" }, // Include table
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
      quantity: { type: Number, required: true },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "pending" },
  paymentStatus: { type: String, default: "pending" },
  paymentMethod: { type: String, default: "credit_card" },
  transactionId: { type: String },
  hasNewItems: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  statusHistory: [{
    timestamp: { type: Date, default: Date.now },
    previousStatus: {
      orderStatus: String,
      paymentStatus: String
    },
    newStatus: {
      orderStatus: String,
      paymentStatus: String
    }
  }]
});

module.exports = mongoose.model("Order", orderSchema);
