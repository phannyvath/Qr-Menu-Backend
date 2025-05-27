const asyncHandler = require("express-async-handler");
const Table = require("../models/tableModel");

// ✅ Create a table (no tableId needed)
const createTable = asyncHandler(async (req, res) => {
  const { status = "normal", people = "" } = req.body;

  const table = await Table.create({ status, people });

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Table created successfully",
    table,
  });
});

// ✅ Get all tables
const getAllTables = asyncHandler(async (req, res) => {
  const tables = await Table.find().sort({ createdAt: -1 });

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Tables fetched successfully",
    tables,
  });
});

// ✅ Update a table by _id
const updateTable = asyncHandler(async (req, res) => {
  const { _id, status, people } = req.body;

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

  if (typeof status === "string") table.status = status;
  if (typeof people === "string") table.people = people;

  await table.save();

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Table updated successfully",
    table,
  });
});

// ✅ Delete a table by _id
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

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Table deleted successfully",
    table: deleted,
  });
});

module.exports = {
  createTable,
  getAllTables,
  updateTable,
  deleteTable,
};
