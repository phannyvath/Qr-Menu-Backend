const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // You need to get this from your Stripe dashboard
const Order = require("../models/orderModel");

// Initiate a payment for the order
const createPayment = asyncHandler(async (req, res) => {
  const { orderCode } = req.body;

  // Fetch the order from the database
  const order = await Order.findOne({ orderCode });

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (order.paymentStatus !== "pending") {
    return res.status(400).json({
      success: false,
      message: "Payment has already been processed for this order",
    });
  }

  // Create a payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.totalPrice * 100, // amount in cents
    currency: "usd", // or your preferred currency
    metadata: { orderCode: order.orderCode },
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: "Payment initiated",
    clientSecret: paymentIntent.client_secret, // Send client secret to client for frontend
  });
});

// Confirm the payment status after payment is completed
const confirmPayment = asyncHandler(async (req, res) => {
  const { orderCode, paymentStatus, transactionId } = req.body;

  const order = await Order.findOne({ orderCode });

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // Update the payment status based on the response from the payment gateway
  order.paymentStatus = paymentStatus;
  order.transactionId = transactionId;
  order.status = paymentStatus === "paid" ? "completed" : "failed";

  await order.save();

  res.status(200).json({
    success: true,
    message: `Payment ${paymentStatus === "paid" ? "successful" : "failed"}`,
    order,
  });
});

module.exports = { createPayment, confirmPayment };
