const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Food = require("../models/foodModel");
const Table = require("../models/tableModel");

// ✅ Create Order
const order = asyncHandler(async (req, res) => {
  const { items, webID, tableId } = req.body;
  const numericWebID = Number(webID);

  if (!numericWebID || !items?.length || !tableId) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields",
    });
  }

  const table = await Table.findById(tableId);
  if (!table) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Invalid table ID",
    });
  }

  const foodIds = items.map(item => item.foodId);
  const foodDocs = await Food.find({ _id: { $in: foodIds }, webID: numericWebID });

  if (foodDocs.length !== items.length) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "One or more food items are invalid",
    });
  }

  let totalPrice = 0;
  const enrichedItems = items.map(item => {
    const food = foodDocs.find(f => f._id.toString() === item.foodId);
    const subtotal = food.price * item.quantity;
    totalPrice += subtotal;
    return { foodId: item.foodId, quantity: item.quantity };
  });

  const { nanoid } = await import("nanoid");
  const orderCode = nanoid(8);

  const newOrder = await Order.create({
    orderCode,
    webID: numericWebID,
    tableId,
    items: enrichedItems,
    totalPrice,
  });

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Order placed successfully",
    order: {
      orderCode,
      webID: numericWebID,
      tableId,
      totalPrice,
      items: enrichedItems,
    },
  });
});

// ✅ Get Orders (with optional orderCode filter)
const getOrders = asyncHandler(async (req, res) => {
  const { webID, orderCode } = req.body;
  const numericWebID = Number(webID);

  if (!numericWebID) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing webID",
    });
  }

  const query = { webID: numericWebID };
  if (orderCode) query.orderCode = orderCode;

  const orders = await Order.find(query)
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
    message: orderCode ? "Order verified" : "Orders retrieved successfully",
    orders,
  });
});

module.exports = {
  order,
  getOrders,
};
