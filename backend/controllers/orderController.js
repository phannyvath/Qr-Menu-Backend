const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Food = require("../models/foodModel");
const Table = require("../models/tableModel");
const User = require("../models/User");

// ✅ Create Order
const order = asyncHandler(async (req, res) => {
  const { username, items, tableId } = req.body;

  if (!items?.length || !tableId) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields",
    });
  }

  const user = await User.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
  if (!user) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "User not found",
    });
  }

  const webID = user.webID;

  // Check for an open order for this table
  let openOrder = await Order.findOne({ tableId, paymentStatus: { $ne: 'paid' } });

  // Prepare food validation
  const foodIds = items.map(item => item.foodId);
  const foodDocs = await Food.find({ _id: { $in: foodIds }, webID: webID });

  if (foodDocs.length !== items.length) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "One or more food items are invalid",
    });
  }

  // Calculate total price for new items
  let newItemsTotal = 0;
  const enrichedItems = items.map(item => {
    const food = foodDocs.find(f => f._id.toString() === item.foodId);
    const subtotal = food.price * item.quantity;
    newItemsTotal += subtotal;
    return { foodId: item.foodId, quantity: item.quantity };
  });

  if (openOrder) {
    // Merge new items into existing order
    for (const newItem of enrichedItems) {
      const existing = openOrder.items.find(i => i.foodId.toString() === newItem.foodId);
      if (existing) {
        existing.quantity += newItem.quantity;
      } else {
        openOrder.items.push(newItem);
      }
    }
    openOrder.totalPrice += newItemsTotal;
    await openOrder.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Order updated successfully",
      order: openOrder,
    });
  } else {
    // Create a new order
    const { nanoid } = await import("nanoid");
    const orderCode = nanoid(8);

    const newOrder = await Order.create({
      orderCode,
      webID: webID,
      tableId,
      items: enrichedItems,
      totalPrice: newItemsTotal,
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  }
});

// ✅ Get Orders strictly by webID
const getOrders = asyncHandler(async (req, res) => {
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
    .populate("items.foodId", "foodName price")
    .populate("tableId", "type status people");

  if (!orders.length) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "No orders found",
    });
  }

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Orders retrieved successfully",
    orders,
  });
});

// ✅ Get current unpaid order for a table
const getCurrentOrderForTable = asyncHandler(async (req, res) => {
  const { tableId } = req.body;
  if (!tableId) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing tableId",
    });
  }
  // Find the latest order for this table where paymentStatus is not 'paid'
  const order = await Order.findOne({ tableId, paymentStatus: { $ne: 'paid' } })
    .sort({ createdAt: -1 })
    .populate("items.foodId", "foodName price")
    .populate("tableId", "type status people");

  if (!order) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "No current unpaid order for this table",
    });
  }

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Current unpaid order retrieved successfully",
    order,
  });
});

module.exports = {
  order,
  getOrders,
  getCurrentOrderForTable,
};
