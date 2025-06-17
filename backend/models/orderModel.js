const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  webID: { type: String, required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
      quantity: { type: Number, required: true },
      status: { 
        type: String, 
        enum: ['pending', 'preparing', 'ready', 'served'],
        default: 'pending'
      },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "pending" },
  paymentStatus: { type: String, default: "pending" },
  paymentMethod: { type: String, default: "credit_card" },
  transactionId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
