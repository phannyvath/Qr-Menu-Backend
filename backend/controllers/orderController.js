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

  // Check for an active order for this table (not completed or cancelled)
  let openOrder = await Order.findOne({ 
    tableId, 
    status: { $nin: ['completed', 'cancelled'] }
  });

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
    return {
      foodId: item.foodId,
      quantity: item.quantity,
      addedAt: new Date(),
      status: 'pending' // Add status for each item
    };
  });

  if (openOrder) {
    // Merge new items into existing order
    for (const newItem of enrichedItems) {
      const existing = openOrder.items.find(i => i.foodId.toString() === newItem.foodId);
      if (existing) {
        existing.quantity += newItem.quantity;
        existing.addedAt = new Date();
        existing.status = 'pending'; // Reset status for updated items
      } else {
        openOrder.items.push(newItem);
      }
    }
    openOrder.totalPrice += newItemsTotal;
    openOrder.hasNewItems = true;
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
      status: 'pending',
      paymentStatus: 'pending',
      hasNewItems: true,
      statusHistory: [{
        timestamp: new Date(),
        previousStatus: null,
        newStatus: {
          orderStatus: 'pending',
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
    
    // Separate items into ready and new
    const readyItems = orderObj.items.filter(item => item.status === 'ready');
    const newItems = orderObj.items.filter(item => item.status === 'pending');

    return {
      ...orderObj,
      readyItems,
      newItems,
      displayInfo: {
        hasNewItems: newItems.length > 0,
        newItemsCount: newItems.length,
        readyItemsCount: readyItems.length,
        totalItemsCount: orderObj.items.length,
        status: orderObj.status,
        paymentStatus: orderObj.paymentStatus,
        tableId: orderObj.tableId?.tableId,
        orderCode: orderObj.orderCode,
        totalPrice: orderObj.totalPrice,
        createdAt: orderObj.createdAt,
        lastUpdated: orderObj.statusHistory[orderObj.statusHistory.length - 1]?.timestamp || orderObj.createdAt
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
  
  // Separate items into ready and new
  const readyItems = orderObj.items.filter(item => item.status === 'ready');
  const newItems = orderObj.items.filter(item => item.status === 'pending');

  const formattedOrder = {
    ...orderObj,
    readyItems,
    newItems,
    displayInfo: {
      hasNewItems: newItems.length > 0,
      newItemsCount: newItems.length,
      readyItemsCount: readyItems.length,
      totalItemsCount: orderObj.items.length,
      status: orderObj.status,
      paymentStatus: orderObj.paymentStatus,
      tableId: orderObj.tableId?.tableId,
      orderCode: orderObj.orderCode,
      totalPrice: orderObj.totalPrice,
      createdAt: orderObj.createdAt,
      lastUpdated: orderObj.statusHistory[orderObj.statusHistory.length - 1]?.timestamp || orderObj.createdAt
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
  const { orderCode, orderStatus, paymentStatus, itemIds } = req.body;

  if (!orderCode || (!orderStatus && !paymentStatus && !itemIds)) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields (orderCode and either orderStatus, paymentStatus, or itemIds)",
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

  // Handle item status updates
  if (itemIds && itemIds.length > 0) {
    order.items.forEach(item => {
      if (itemIds.includes(item._id.toString())) {
        item.status = 'ready'; // Mark specific items as ready
      }
    });
    statusMessage = 'Selected items marked as ready';
  }

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
        // When payment is made, automatically complete the order
        newOrderStatus = 'completed';
        statusMessage = 'Order completed and paid successfully';
        // Update table status to Available when order is completed
        if (order.tableId) {
          await Table.findByIdAndUpdate(order.tableId._id, { status: 'available' });
        }
        break;
      case 'cancelled':
        // When payment is cancelled, automatically cancel the order
        newOrderStatus = 'cancelled';
        statusMessage = 'Order and payment have been cancelled';
        // Update table status to Available when order is cancelled
        if (order.tableId) {
          await Table.findByIdAndUpdate(order.tableId._id, { status: 'available' });
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
      case 'pending':
        statusMessage = 'Order is pending';
        break;
      case 'preparing':
        statusMessage = 'Order is being prepared';
        // Reset hasNewItems flag when order status changes to preparing
        order.hasNewItems = false;
        break;
      case 'ready':
        statusMessage = 'Order is ready for payment';
        // If already paid, mark as completed
        if (order.paymentStatus === 'paid') {
          newOrderStatus = 'completed';
          statusMessage = 'Order completed and paid successfully';
          if (order.tableId) {
            await Table.findByIdAndUpdate(order.tableId._id, { status: 'available' });
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
          await Table.findByIdAndUpdate(order.tableId._id, { status: 'available' });
        }
        break;
      case 'cancelled':
        // When order is cancelled, automatically cancel the payment
        newPaymentStatus = 'cancelled';
        statusMessage = 'Order and payment have been cancelled';
        if (order.tableId) {
          await Table.findByIdAndUpdate(order.tableId._id, { status: 'available' });
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

  // Format the response to separate ready and new items
  const orderResponse = order.toObject();
  const readyItems = orderResponse.items.filter(item => item.status === 'ready');
  const newItems = orderResponse.items.filter(item => item.status === 'pending');

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: statusMessage,
    order: {
      ...orderResponse,
      readyItems,
      newItems,
      displayInfo: {
        hasNewItems: newItems.length > 0,
        newItemsCount: newItems.length,
        readyItemsCount: readyItems.length,
        totalItemsCount: orderResponse.items.length,
        status: orderResponse.status,
        paymentStatus: orderResponse.paymentStatus,
        tableId: orderResponse.tableId?.tableId,
        orderCode: orderResponse.orderCode,
        totalPrice: orderResponse.totalPrice,
        createdAt: orderResponse.createdAt,
        lastUpdated: orderResponse.statusHistory[orderResponse.statusHistory.length - 1]?.timestamp || orderResponse.createdAt
      }
    }
  });
});

module.exports = {
  order,
  getOrders,
  getCurrentOrderForTable,
  updateOrderPaymentStatus,
};
