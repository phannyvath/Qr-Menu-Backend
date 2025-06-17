const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Food = require("../models/foodModel");
const Table = require("../models/tableModel");

// Get sales report with date range
const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, webID } = req.body;

  if (!startDate || !endDate || !webID) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields (startDate, endDate, webID)",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Include the entire end date

  // Get all completed orders within date range
  const orders = await Order.find({
    webID,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: { $gte: start, $lte: end }
  }).populate('items.foodId', 'foodName price');

  // Calculate total sales
  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  // Calculate sales by food item
  const foodSales = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const foodName = item.foodId.foodName;
      const itemTotal = item.foodId.price * item.quantity;
      
      if (!foodSales[foodName]) {
        foodSales[foodName] = {
          quantity: 0,
          total: 0
        };
      }
      foodSales[foodName].quantity += item.quantity;
      foodSales[foodName].total += itemTotal;
    });
  });

  // Calculate sales by date
  const salesByDate = {};
  orders.forEach(order => {
    const date = order.createdAt.toISOString().split('T')[0];
    if (!salesByDate[date]) {
      salesByDate[date] = 0;
    }
    salesByDate[date] += order.totalPrice;
  });

  // Calculate average order value
  const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Sales report generated successfully",
    report: {
      dateRange: {
        start: startDate,
        end: endDate
      },
      summary: {
        totalOrders: orders.length,
        totalSales,
        averageOrderValue
      },
      salesByFood: foodSales,
      salesByDate,
      orders
    }
  });
});

// Get table utilization report
const getTableUtilizationReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, webID } = req.body;

  if (!startDate || !endDate || !webID) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields (startDate, endDate, webID)",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Get all orders within date range
  const orders = await Order.find({
    webID,
    createdAt: { $gte: start, $lte: end }
  }).populate('tableId', 'tableId type');

  // Calculate table utilization
  const tableUtilization = {};
  orders.forEach(order => {
    const tableId = order.tableId.tableId;
    if (!tableUtilization[tableId]) {
      tableUtilization[tableId] = {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        type: order.tableId.type
      };
    }
    tableUtilization[tableId].totalOrders++;
    tableUtilization[tableId].totalRevenue += order.totalPrice;
  });

  // Calculate averages
  Object.keys(tableUtilization).forEach(tableId => {
    const table = tableUtilization[tableId];
    table.averageOrderValue = table.totalRevenue / table.totalOrders;
  });

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Table utilization report generated successfully",
    report: {
      dateRange: {
        start: startDate,
        end: endDate
      },
      tableUtilization
    }
  });
});

// Get popular items report
const getPopularItemsReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, webID } = req.body;

  if (!startDate || !endDate || !webID) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields (startDate, endDate, webID)",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Get all completed orders within date range
  const orders = await Order.find({
    webID,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: { $gte: start, $lte: end }
  }).populate('items.foodId', 'foodName price category');

  // Calculate item popularity
  const itemPopularity = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const foodName = item.foodId.foodName;
      const category = item.foodId.category;
      
      if (!itemPopularity[foodName]) {
        itemPopularity[foodName] = {
          quantity: 0,
          revenue: 0,
          category,
          orders: 0
        };
      }
      itemPopularity[foodName].quantity += item.quantity;
      itemPopularity[foodName].revenue += item.foodId.price * item.quantity;
      itemPopularity[foodName].orders++;
    });
  });

  // Sort items by quantity
  const sortedItems = Object.entries(itemPopularity)
    .sort(([, a], [, b]) => b.quantity - a.quantity)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Popular items report generated successfully",
    report: {
      dateRange: {
        start: startDate,
        end: endDate
      },
      popularItems: sortedItems
    }
  });
});

// Get hourly sales report
const getHourlySalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, webID } = req.body;

  if (!startDate || !endDate || !webID) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields (startDate, endDate, webID)",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Get all completed orders within date range
  const orders = await Order.find({
    webID,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: { $gte: start, $lte: end }
  });

  // Calculate hourly sales
  const hourlySales = {};
  for (let i = 0; i < 24; i++) {
    hourlySales[i] = {
      totalSales: 0,
      orderCount: 0,
      averageOrderValue: 0
    };
  }

  orders.forEach(order => {
    const hour = order.createdAt.getHours();
    hourlySales[hour].totalSales += order.totalPrice;
    hourlySales[hour].orderCount++;
  });

  // Calculate averages
  Object.keys(hourlySales).forEach(hour => {
    const data = hourlySales[hour];
    data.averageOrderValue = data.orderCount > 0 ? data.totalSales / data.orderCount : 0;
  });

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Hourly sales report generated successfully",
    report: {
      dateRange: {
        start: startDate,
        end: endDate
      },
      hourlySales
    }
  });
});

// Get category performance report
const getCategoryPerformanceReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, webID } = req.body;

  if (!startDate || !endDate || !webID) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields (startDate, endDate, webID)",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Get all completed orders within date range
  const orders = await Order.find({
    webID,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: { $gte: start, $lte: end }
  }).populate('items.foodId', 'foodName price category');

  // Calculate category performance
  const categoryPerformance = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const category = item.foodId.category;
      const itemTotal = item.foodId.price * item.quantity;
      
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = {
          totalSales: 0,
          itemCount: 0,
          orderCount: 0,
          items: {}
        };
      }
      
      categoryPerformance[category].totalSales += itemTotal;
      categoryPerformance[category].itemCount += item.quantity;
      categoryPerformance[category].orderCount++;

      // Track individual items in category
      const foodName = item.foodId.foodName;
      if (!categoryPerformance[category].items[foodName]) {
        categoryPerformance[category].items[foodName] = {
          quantity: 0,
          revenue: 0
        };
      }
      categoryPerformance[category].items[foodName].quantity += item.quantity;
      categoryPerformance[category].items[foodName].revenue += itemTotal;
    });
  });

  // Calculate percentages and sort items within categories
  Object.keys(categoryPerformance).forEach(category => {
    const data = categoryPerformance[category];
    data.averageOrderValue = data.orderCount > 0 ? data.totalSales / data.orderCount : 0;
    
    // Sort items by revenue
    data.items = Object.entries(data.items)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  });

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Category performance report generated successfully",
    report: {
      dateRange: {
        start: startDate,
        end: endDate
      },
      categoryPerformance
    }
  });
});

// Get customer behavior report
const getCustomerBehaviorReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, webID } = req.body;

  if (!startDate || !endDate || !webID) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields (startDate, endDate, webID)",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Get all completed orders within date range
  const orders = await Order.find({
    webID,
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: { $gte: start, $lte: end }
  }).populate('tableId', 'tableId type');

  // Calculate customer behavior metrics
  const customerBehavior = {
    averageOrderValue: 0,
    averageItemsPerOrder: 0,
    peakHours: {},
    tableTypePreference: {},
    orderFrequency: {
      daily: {},
      weekly: {},
      monthly: {}
    }
  };

  let totalItems = 0;
  orders.forEach(order => {
    // Calculate average order value
    customerBehavior.averageOrderValue += order.totalPrice;
    
    // Calculate items per order
    totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Track peak hours
    const hour = order.createdAt.getHours();
    customerBehavior.peakHours[hour] = (customerBehavior.peakHours[hour] || 0) + 1;
    
    // Track table type preference
    const tableType = order.tableId.type;
    customerBehavior.tableTypePreference[tableType] = (customerBehavior.tableTypePreference[tableType] || 0) + 1;
    
    // Track order frequency
    const date = order.createdAt.toISOString().split('T')[0];
    const dayOfWeek = order.createdAt.getDay();
    const month = order.createdAt.getMonth();
    
    customerBehavior.orderFrequency.daily[date] = (customerBehavior.orderFrequency.daily[date] || 0) + 1;
    customerBehavior.orderFrequency.weekly[dayOfWeek] = (customerBehavior.orderFrequency.weekly[dayOfWeek] || 0) + 1;
    customerBehavior.orderFrequency.monthly[month] = (customerBehavior.orderFrequency.monthly[month] || 0) + 1;
  });

  // Calculate averages
  const orderCount = orders.length;
  customerBehavior.averageOrderValue = orderCount > 0 ? customerBehavior.averageOrderValue / orderCount : 0;
  customerBehavior.averageItemsPerOrder = orderCount > 0 ? totalItems / orderCount : 0;

  // Sort peak hours
  customerBehavior.peakHours = Object.entries(customerBehavior.peakHours)
    .sort(([, a], [, b]) => b - a)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Customer behavior report generated successfully",
    report: {
      dateRange: {
        start: startDate,
        end: endDate
      },
      customerBehavior
    }
  });
});

module.exports = {
  getSalesReport,
  getTableUtilizationReport,
  getPopularItemsReport,
  getHourlySalesReport,
  getCategoryPerformanceReport,
  getCustomerBehaviorReport
}; 