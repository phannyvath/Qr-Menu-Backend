const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Food = require("../models/foodModel");

// Guest places an order
const createGuestOrder = asyncHandler(async (req, res) => {
  const { items, webID } = req.body;
  const numericWebID = Number(webID); // Ensure correct type

  // Validate input
  if (!numericWebID || !items?.length) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields",
    });
  }

  // Log inputs for debugging
  const foodIds = items.map(item => item.foodId);
  console.log("🟡 Incoming foodIds:", foodIds);
  console.log("🟡 Incoming webID:", numericWebID);
  console.log("🟡 Type of webID:", typeof numericWebID);

  const allFoods = await Food.find({});
  console.log("🧾 All foods in DB:", allFoods.map(f => ({
    _id: f._id.toString(),
    foodName: f.foodName,
    webID: f.webID,
  })));

  // Match food items with webID
  const foodDocs = await Food.find({
    _id: { $in: foodIds },
    webID: numericWebID,
  });

  console.log("✅ Matched foodDocs:", foodDocs);

  if (foodDocs.length !== items.length) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "One or more food items are invalid",
    });
  }

  // Calculate total price
  let totalPrice = 0;
  const enrichedItems = items.map(item => {
    const food = foodDocs.find(f => f._id.toString() === item.foodId);
    const subtotal = food.price * item.quantity;
    totalPrice += subtotal;
    return {
      foodId: item.foodId,
      quantity: item.quantity,
    };
  });

  // Generate order code
  const { nanoid } = await import("nanoid");
  const orderCode = nanoid(8);

  // Save order
  const newOrder = await Order.create({
    orderCode,
    webID: numericWebID,
    items: enrichedItems,
    totalPrice,
  });

  // Send response
  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Order placed successfully",
    order: {
      orderCode,
      webID: numericWebID,
      totalPrice,
      items: enrichedItems,
    },
  });
});

// Get all orders by webID from request body
const getOrdersByWebID = asyncHandler(async (req, res) => {
  const { webID } = req.body;
  const numericWebID = Number(webID);

  if (!numericWebID) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing webID",
    });
  }

  const orders = await Order.find({ webID: numericWebID })
    .populate("items.foodId", "foodName price");

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: orders.length ? "Orders retrieved successfully" : "No orders found",
    orders,
  });
});

// Verify a specific order by code (uses webID from req.body)
const verifyOrderByCode = asyncHandler(async (req, res) => {
  const { orderCode, webID } = req.body;
  const numericWebID = Number(webID);

  if (!orderCode || !numericWebID) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing orderCode or webID",
    });
  }

  const order = await Order.findOne({ orderCode, webID: numericWebID })
    .populate("items.foodId", "foodName price");

  if (!order) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Order not found",
    });
  }

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Order verified",
    order,
  });
});

module.exports = {
  createGuestOrder,
  getOrdersByWebID,
  verifyOrderByCode,
};
