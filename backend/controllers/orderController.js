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

  // Check if table exists and is available
  const table = await Table.findById(tableId);
  if (!table) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Table not found",
    });
  }

  if (table.status !== 'Free') {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Table is not available",
    });
  }

  // Check for an active order for this table (not completed or cancelled)
  let openOrder = await Order.findOne({ 
    tableId, 
    status: { $nin: ['completed', 'cancelled'] }
  });

  // If there's an active order, check if it's from the same user
  if (openOrder && openOrder.webID !== webID) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "There is already an active order for this table",
    });
  }

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
      message: "Order updated successfully. You can continue adding items until payment is made.",
      order: openOrder,
    });
  } else {
    // Create a new order
    const { nanoid } = await import("nanoid");
    const orderCode = nanoid(8);

    // Update table status to Busy
    await Table.findByIdAndUpdate(tableId, { status: 'Busy' });

    const newOrder = await Order.create({
      orderCode,
      webID: webID,
      tableId,
      items: enrichedItems,
      totalPrice: newItemsTotal,
      status: 'active',
      paymentStatus: 'pending',
      statusHistory: [{
        timestamp: new Date(),
        previousStatus: null,
        newStatus: {
          orderStatus: 'active',
          paymentStatus: 'pending'
        }
      }]
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Order placed successfully. You can continue adding items until payment is made.",
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

// ✅ Update order status and payment status
const updateOrderPaymentStatus = asyncHandler(async (req, res) => {
  const { orderCode, orderStatus, paymentStatus } = req.body;

  if (!orderCode || (!orderStatus && !paymentStatus)) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields (orderCode and either orderStatus or paymentStatus)",
    });
  }

  // Validate payment status if provided
  if (paymentStatus) {
    const validPaymentStatuses = ['pending', 'paid', 'cancelled'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(200).json({
        statusCode: 201,
        success: false,
        message: "Invalid payment status. Must be one of: pending, paid, cancelled",
      });
    }
  }

  // Validate order status if provided
  if (orderStatus) {
    const validOrderStatuses = ['active', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validOrderStatuses.includes(orderStatus)) {
      return res.status(200).json({
        statusCode: 201,
        success: false,
        message: "Invalid order status. Must be one of: active, preparing, ready, completed, cancelled",
      });
    }
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

  // Prevent updating cancelled orders
  if (order.status === 'cancelled') {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Cannot update cancelled order",
    });
  }

  // Store previous status for history
  const previousStatus = {
    orderStatus: order.status,
    paymentStatus: order.paymentStatus
  };

  let statusMessage = '';
  let newOrderStatus = order.status;
  let newPaymentStatus = order.paymentStatus;

  // Handle payment status update
  if (paymentStatus) {
    // Prevent changing payment status if order is already paid
    if (order.paymentStatus === 'paid' && paymentStatus !== 'paid') {
      return res.status(200).json({
        statusCode: 201,
        success: false,
        message: "Cannot change payment status of a paid order",
      });
    }

    newPaymentStatus = paymentStatus;
    
    switch (paymentStatus) {
      case 'paid':
        // Only set to completed if order is ready
        if (order.status === 'ready') {
          newOrderStatus = 'completed';
          statusMessage = 'Order completed and paid successfully';
          // Update table status to Free when order is completed
          if (order.tableId) {
            await Table.findByIdAndUpdate(order.tableId._id, { status: 'Free' });
          }
        } else {
          statusMessage = 'Payment received, waiting for order to be ready';
        }
        break;
      case 'cancelled':
        newOrderStatus = 'cancelled';
        statusMessage = 'Order has been cancelled';
        // Update table status to Free when order is cancelled
        if (order.tableId) {
          await Table.findByIdAndUpdate(order.tableId._id, { status: 'Free' });
        }
        break;
      case 'pending':
        // Don't change order status for pending payment
        statusMessage = 'Payment status set to pending';
        break;
    }
  }

  // Handle order status update (only if not cancelled)
  if (orderStatus && order.status !== 'cancelled') {
    // Prevent changing order status if payment is already made
    if (order.paymentStatus === 'paid' && orderStatus !== 'completed') {
      return res.status(200).json({
        statusCode: 201,
        success: false,
        message: "Cannot change status of a paid order",
      });
    }

    newOrderStatus = orderStatus;
    
    switch (orderStatus) {
      case 'active':
        statusMessage = 'Order is active and can be modified';
        break;
      case 'preparing':
        statusMessage = 'Order is being prepared';
        break;
      case 'ready':
        statusMessage = 'Order is ready for payment';
        // If already paid, mark as completed
        if (order.paymentStatus === 'paid') {
          newOrderStatus = 'completed';
          statusMessage = 'Order completed and paid successfully';
          if (order.tableId) {
            await Table.findByIdAndUpdate(order.tableId._id, { status: 'Free' });
          }
        }
        break;
      case 'completed':
        // Only allow if payment is made
        if (order.paymentStatus !== 'paid') {
          return res.status(200).json({
            statusCode: 201,
            success: false,
            message: "Cannot mark order as completed without payment",
          });
        }
        statusMessage = 'Order is completed';
        if (order.tableId) {
          await Table.findByIdAndUpdate(order.tableId._id, { status: 'Free' });
        }
        break;
      case 'cancelled':
        statusMessage = 'Order has been cancelled';
        if (order.tableId) {
          await Table.findByIdAndUpdate(order.tableId._id, { status: 'Free' });
        }
        break;
    }
  }

  // Update the order
  order.status = newOrderStatus;
  order.paymentStatus = newPaymentStatus;

  // Add status history
  if (!order.statusHistory) {
    order.statusHistory = [];
  }
  order.statusHistory.push({
    timestamp: new Date(),
    previousStatus,
    newStatus: {
      orderStatus: order.status,
      paymentStatus: order.paymentStatus
    }
  });
  
  await order.save();

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: statusMessage,
    order,
  });
});

module.exports = {
  order,
  getOrders,
  getCurrentOrderForTable,
  updateOrderPaymentStatus,
};
