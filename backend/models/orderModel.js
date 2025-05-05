const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  webID: { type: String, required: true },
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
      quantity: { type: Number, required: true },
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "pending" },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" }, // New field
  paymentMethod: { type: String, enum: ["credit_card", "paypal", "bank_transfer"], default: "credit_card" }, // New field
  transactionId: { type: String }, // New field to store payment transaction ID
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
