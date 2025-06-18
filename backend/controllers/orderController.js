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

  // Check if table exists
  const table = await Table.findById(tableId);
  if (!table) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Table not found",
    });
  }

  // Check for existing pending order for this table
  let order = await Order.findOne({ 
    tableId, 
    paymentStatus: 'pending'
  }).populate("items.foodId", "foodName price");

  // Calculate total price and prepare items with status
  let totalPrice = 0;
  const newItems = [];

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
    newItems.push({
      foodId: item.foodId,
      quantity: item.quantity,
      status: 'pending',
      addedAt: new Date()
    });
  }

  if (order) {
    // Update existing items or add new ones
    for (const newItem of newItems) {
      // Find existing item with same foodId and pending status
      const existingItem = order.items.find(
        item => item.foodId.toString() === newItem.foodId.toString() && 
        item.status === 'pending'
      );

      if (existingItem) {
        // If same food exists and is pending, increase quantity
        existingItem.quantity += newItem.quantity;
      } else {
        // If different food or status, add as new item
        order.items.push(newItem);
      }
    }

    // Calculate new total price based on pending items only
    const pendingItems = order.items.filter(item => item.status === 'pending');
    order.totalPrice = pendingItems.reduce((total, item) => {
      return total + (item.foodId.price * item.quantity);
    }, 0);

    await order.save();
  } else {
    // Generate order code for new order
    const orderCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create new order
    order = await Order.create({
      tableId,
      items: newItems,
      totalPrice,
      orderCode,
      webID,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Update table status to busy
    await Table.findByIdAndUpdate(tableId, { status: 'busy' });
  }

  // Format the response
  const orderResponse = order.toObject();
  const readyItems = orderResponse.items.filter(item => item.status === 'ready');
  const pendingItems = orderResponse.items.filter(item => item.status === 'pending');
  const completedItems = orderResponse.items.filter(item => item.status === 'completed');

  // Calculate separate totals
  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      return total + (item.foodId.price * item.quantity);
    }, 0);
  };

  const readyTotal = calculateTotal(readyItems);
  const pendingTotal = calculateTotal(pendingItems);
  const completedTotal = calculateTotal(completedItems);

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: order ? "Items added to existing order" : "New order created successfully",
    order: {
      orderCode: orderResponse.orderCode,
      tableId: orderResponse.tableId,
      totalPrice: pendingTotal, // Use pending total as the main totalPrice
      status: orderResponse.status,
      paymentStatus: orderResponse.paymentStatus,
      readyItems,
      pendingItems,
      completedItems,
      totals: {
        ready: readyTotal,
        pending: pendingTotal,
        completed: completedTotal,
        overall: orderResponse.totalPrice
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
    .populate("tableId", "type status people tableId");

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
  const { orderCode, itemIds, status, paymentStatus } = req.body;

  if (!orderCode || (!status && !paymentStatus && !itemIds)) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields (orderCode and either status, paymentStatus, or itemIds)",
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
  if (itemIds && itemIds.length > 0 && status) {
    let updatedCount = 0;
    const updatedItems = [];

    // First, update the status of selected items
    order.items.forEach(item => {
      if (itemIds.includes(item._id.toString())) {
        item.status = status;
        updatedItems.push(item);
        updatedCount++;
      }
    });

    // Then, combine items with same foodId and status
    const combinedItems = [];
    const processedIds = new Set();

    order.items.forEach(item => {
      if (processedIds.has(item._id.toString())) return;

      const sameItems = order.items.filter(
        otherItem => 
          otherItem.foodId.toString() === item.foodId.toString() && 
          otherItem.status === item.status
      );

      if (sameItems.length > 1) {
        // Combine quantities
        const totalQuantity = sameItems.reduce((sum, i) => sum + i.quantity, 0);
        combinedItems.push({
          ...item,
          quantity: totalQuantity
        });
        sameItems.forEach(i => processedIds.add(i._id.toString()));
      } else {
        combinedItems.push(item);
        processedIds.add(item._id.toString());
      }
    });

    // Update order with combined items
    order.items = combinedItems;
    statusMessage = `${updatedCount} item(s) marked as ${status}`;
  }

  // Handle payment status update
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    
    if (paymentStatus === 'paid') {
      // Update all items to completed when paid
      order.items.forEach(item => {
        item.status = 'completed';
      });
      order.status = 'completed';
      statusMessage = 'Order completed and paid successfully';
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
  const completedItems = orderResponse.items.filter(item => item.status === 'completed');

  // Calculate separate totals
  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      return total + (item.foodId.price * item.quantity);
    }, 0);
  };

  const readyTotal = calculateTotal(readyItems);
  const pendingTotal = calculateTotal(pendingItems);
  const completedTotal = calculateTotal(completedItems);

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: statusMessage || "Order updated successfully",
    order: {
      orderCode: orderResponse.orderCode,
      tableId: orderResponse.tableId?.tableId,
      totalPrice: pendingTotal,
      status: orderResponse.status,
      paymentStatus: orderResponse.paymentStatus,
      readyItems,
      pendingItems,
      completedItems,
      totals: {
        ready: readyTotal,
        pending: pendingTotal,
        completed: completedTotal,
        overall: orderResponse.totalPrice
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
