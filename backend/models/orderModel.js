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
        enum: ['pending', 'ready', 'cancelled'],
        default: 'pending'
      },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "pending" },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  transactionId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
