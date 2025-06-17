const asyncHandler = require("express-async-handler");
const Table = require("../models/tableModel");

// ✅ Create a new table
const createTable = asyncHandler(async (req, res) => {
  let { tableId, type, status, people } = req.body;

  if (!tableId) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "tableId is required",
    });
  }

  // Check if tableId already exists
  const existingTable = await Table.findOne({ tableId });
  if (existingTable) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Table with this tableId already exists",
    });
  }

  const table = await Table.create({ tableId, type, status, people });

  const tableObj = table.toObject();
  delete tableObj.__v;

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Table created successfully",
    table: tableObj,
  });
});

// ✅ Get all tables
const getAllTables = asyncHandler(async (req, res) => {
  const tables = await Table.find().sort({ tableId: 1 });

  const formatted = tables.map((table) => {
    const obj = table.toObject();
    delete obj.__v;
    return obj;
  });

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Tables fetched successfully",
    tables: formatted,
  });
});

// ✅ Update a table
const updateTable = asyncHandler(async (req, res) => {
  const { _id, tableId, type, status, people } = req.body;

  if (!_id) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing _id",
    });
  }

  const table = await Table.findById(_id);
  if (!table) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Table not found",
    });
  }

  // Update other fields if provided
  if (type !== undefined) {
    table.type = type;
  }
  if (status !== undefined) {
    table.status = status;
  }
  if (people !== undefined) {
    table.people = people;
  }

  if (tableId !== undefined) {
    table.tableId = tableId;
  }

  await table.save();

  const tableObj = table.toObject();
  delete tableObj.__v;

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Table updated successfully",
    table: tableObj,
  });
});

// ✅ Delete a table
const deleteTable = asyncHandler(async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing _id",
    });
  }

  const deleted = await Table.findByIdAndDelete(_id);
  if (!deleted) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Table not found",
    });
  }

  const deletedObj = deleted.toObject();
  delete deletedObj.__v;

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Table deleted successfully",
    table: deletedObj,
  });
});

// Update table status
const updateTableStatus = asyncHandler(async (req, res) => {
  const { tableId, status, webID } = req.body;

  if (!tableId || !status || !webID) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing required fields (tableId, status, webID)",
    });
  }

  // Validate status
  const validStatuses = ["available", "busy"];
  if (!validStatuses.includes(status)) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Invalid status. Must be one of: Available, Busy",
    });
  }

  // Find the table by tableId and webID
  const table = await Table.findOne({ tableId, webID });

  if (!table) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Table not found",
    });
  }

  // Update the status
  table.status = status;
  await table.save();

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Table status updated successfully",
    table,
  });
});

module.exports = {
  createTable,
  getAllTables,
  updateTable,
  deleteTable,
  updateTableStatus,
};
