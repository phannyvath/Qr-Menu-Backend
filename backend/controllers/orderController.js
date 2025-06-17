const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Food = require("../models/foodModel");
const Table = require("../models/tableModel");
const User = require("../models/User");

// ✅ Create Order
const createOrder = asyncHandler(async (req, res) => {
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

  // Check if table exists and is available
  const table = await Table.findById(tableId);
  if (!table) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Table not found",
    });
  }

  if (table.status !== 'available') {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Table is not available",
    });
  }

  // Calculate total price and prepare items with status
  let totalPrice = 0;
  const itemsWithStatus = [];

  // Process each item sequentially
  for (const item of items) {
    const food = await Food.findById(item.foodId);
    if (!food) {
      return res.status(200).json({
        statusCode: 201,
        success: false,
        message: `Food item ${item.foodId} not found`,
      });
    }
    totalPrice += food.price * item.quantity;
    itemsWithStatus.push({
      foodId: item.foodId,
      quantity: item.quantity,
      status: 'pending',
      addedAt: new Date()
    });
  }

  // Generate order code
  const orderCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Create order with items having status
  const order = await Order.create({
    tableId,
    items: itemsWithStatus,
    totalPrice,
    orderCode,
    webID,
    status: 'pending',
    paymentStatus: 'pending'
  });

  // Update table status to busy
  await Table.findByIdAndUpdate(tableId, { status: 'busy' });

  // Format the response
  const orderResponse = order.toObject();
  const readyItems = orderResponse.items.filter(item => item.status === 'ready');
  const pendingItems = orderResponse.items.filter(item => item.status === 'pending');

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Order created successfully",
    order: {
      ...orderResponse,
      readyItems,
      pendingItems,
      displayInfo: {
        pendingItemsCount: pendingItems.length,
        readyItemsCount: readyItems.length,
        totalItemsCount: orderResponse.items.length,
        status: orderResponse.status,
        paymentStatus: orderResponse.paymentStatus,
        tableId: orderResponse.tableId?.tableId,
        orderCode: orderResponse.orderCode,
        totalPrice: orderResponse.totalPrice,
        createdAt: orderResponse.createdAt
      }
    }
  });
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
    .populate("tableId", "tableId type status");

  if (!orders.length) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "No orders found",
    });
  }

  // Format orders for frontend display
  const formattedOrders = orders.map(order => {
    const orderObj = order.toObject();
    
    // Ensure each item has a status field
    const items = orderObj.items.map(item => ({
      ...item,
      status: item.status || 'pending' // Default to pending if status is missing
    }));
    
    // Separate items into ready and pending arrays
    const readyItems = items.filter(item => item.status === 'ready');
    const pendingItems = items.filter(item => item.status === 'pending');

    return {
      ...orderObj,
      items,
      readyItems,
      pendingItems,
      displayInfo: {
        pendingItemsCount: pendingItems.length,
        readyItemsCount: readyItems.length,
        totalItemsCount: items.length,
        status: orderObj.status,
        paymentStatus: orderObj.paymentStatus,
        tableId: orderObj.tableId?.tableId,
        orderCode: orderObj.orderCode,
        totalPrice: orderObj.totalPrice,
        createdAt: orderObj.createdAt
      }
    };
  });

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Orders retrieved successfully",
    orders: formattedOrders,
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

  // Format order for frontend display
  const orderObj = order.toObject();
  
  // Ensure each item has a status field
  const items = orderObj.items.map(item => ({
    ...item,
    status: item.status || 'pending' // Default to pending if status is missing
  }));
  
  // Separate items into ready and pending arrays
  const readyItems = items.filter(item => item.status === 'ready');
  const pendingItems = items.filter(item => item.status === 'pending');

  const formattedOrder = {
    ...orderObj,
    items,
    readyItems,
    pendingItems,
    displayInfo: {
      pendingItemsCount: pendingItems.length,
      readyItemsCount: readyItems.length,
      totalItemsCount: items.length,
      status: orderObj.status,
      paymentStatus: orderObj.paymentStatus,
      tableId: orderObj.tableId?.tableId,
      orderCode: orderObj.orderCode,
      totalPrice: orderObj.totalPrice,
      createdAt: orderObj.createdAt
    }
  };

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Current unpaid order retrieved successfully",
    order: formattedOrder,
  });
});

// ✅ Update order status and payment status
const updateOrderPaymentStatus = asyncHandler(async (req, res) => {
  const { orderCode, orderStatus, paymentStatus, itemUpdates } = req.body;

  if (!orderCode || (!orderStatus && !paymentStatus && !itemUpdates)) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields (orderCode and either orderStatus, paymentStatus, or itemUpdates)",
    });
  }

  const order = await Order.findOne({ orderCode })
    .populate("items.foodId", "foodName price")
    .populate("tableId", "tableId type status");

  if (!order) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Order not found",
    });
  }

  let statusMessage = '';

  // Handle item status updates
  if (itemUpdates && itemUpdates.length > 0) {
    for (const update of itemUpdates) {
      const item = order.items.id(update.itemId);
      if (item) {
        item.status = update.status;
      }
    }
    statusMessage = 'Item statuses updated successfully';
  }

  // Handle payment status update
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    
    if (paymentStatus === 'paid') {
      order.status = 'completed';
      statusMessage = 'Order completed and paid successfully';
      if (order.tableId) {
        await Table.findByIdAndUpdate(order.tableId._id, { status: 'available' });
      }
    }
  }

  // Handle order status update
  if (orderStatus) {
    order.status = orderStatus;
    
    if (orderStatus === 'completed' && order.paymentStatus === 'paid') {
      if (order.tableId) {
        await Table.findByIdAndUpdate(order.tableId._id, { status: 'available' });
      }
    }
  }

  await order.save();

  // Format the response
  const orderResponse = order.toObject();
  const readyItems = orderResponse.items.filter(item => item.status === 'ready');
  const pendingItems = orderResponse.items.filter(item => item.status === 'pending');

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: statusMessage,
    order: {
      ...orderResponse,
      readyItems,
      pendingItems,
      displayInfo: {
        pendingItemsCount: pendingItems.length,
        readyItemsCount: readyItems.length,
        totalItemsCount: orderResponse.items.length,
        status: orderResponse.status,
        paymentStatus: orderResponse.paymentStatus,
        tableId: orderResponse.tableId?.tableId,
        orderCode: orderResponse.orderCode,
        totalPrice: orderResponse.totalPrice,
        createdAt: orderResponse.createdAt
      }
    }
  });
});

module.exports = {
  createOrder,
  getOrders,
  getCurrentOrderForTable,
  updateOrderPaymentStatus,
};
