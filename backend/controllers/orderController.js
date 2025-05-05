const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const { nanoid } = require("nanoid"); // to generate unique orderCode

// Guest places order
const createGuestOrder = asyncHandler(async (req, res) => {
  const { items, totalPrice, webID } = req.body;

  if (!items?.length || !totalPrice || !webID) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  const orderCode = nanoid(8);

  const newOrder = await Order.create({
    orderCode,
    items,
    totalPrice,
    webID
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    orderCode
  });
});

// Seller gets orders by their webID
const getOrdersBySeller = asyncHandler(async (req, res) => {
  const webID = req.user.webID;

  const orders = await Order.find({ webID })
    .populate("items.foodId", "foodName price");

  res.status(200).json({
    success: true,
    message: "Orders retrieved successfully",
    orders
  });
});

// Seller verifies orderCode
const verifyOrderByCode = asyncHandler(async (req, res) => {
  const { orderCode } = req.params;
  const webID = req.user.webID;

  const order = await Order.findOne({ orderCode, webID })
    .populate("items.foodId", "foodName price");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "Order verified",
    order
  });
});

module.exports = {
  createGuestOrder,
  getOrdersBySeller,
  verifyOrderByCode,
};
