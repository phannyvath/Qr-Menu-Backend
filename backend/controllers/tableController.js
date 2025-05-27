const asyncHandler = require("express-async-handler");
const Table = require("../models/tableModel");

// ✅ Create a new table
const createTable = asyncHandler(async (req, res) => {
  let { type, status, people } = req.body;

  const table = await Table.create({ type, status, people });

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
  const tables = await Table.find().sort({ createdAt: -1 });

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
  const { _id, type, status, people } = req.body;

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

  // Update fields if provided (no value checks)
  if (type !== undefined) {
    table.type = type;
  }
  if (status !== undefined) {
    table.status = status;
  }
  if (people !== undefined) {
    table.people = people;
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

module.exports = {
  createTable,
  getAllTables,
  updateTable,
  deleteTable,
};
