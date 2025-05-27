const asyncHandler = require("express-async-handler");
const Table = require("../models/tableModel");

// Create table with incremental ID
const createTable = asyncHandler(async (req, res) => {
  const { status = "normal", people = "" } = req.body;

  const lastTable = await Table.findOne().sort({ createdAt: -1 });
  const lastId = lastTable ? parseInt(lastTable.tableId) : 0;
  const nextTableId = String(lastId + 1);

  const table = await Table.create({
    tableId: nextTableId,
    status,
    people,
  });

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Table created successfully",
    table,
  });
});

// Get all tables
const getAllTables = asyncHandler(async (req, res) => {
  const tables = await Table.find().sort({ createdAt: -1 });

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Tables fetched successfully",
    tables,
  });
});

// Update a table
const updateTable = asyncHandler(async (req, res) => {
  const { tableId, status, people } = req.body;

  if (!tableId) {
    return res.status(200).json({ statusCode: 201, success: false, message: "Missing tableId" });
  }

  const table = await Table.findOne({ tableId });
  if (!table) {
    return res.status(200).json({ statusCode: 201, success: false, message: "Table not found" });
  }

  if (status && ["normal", "vip"].includes(status)) {
    table.status = status;
  }

  if (typeof people === "string") {
    table.people = people;
  }

  await table.save();

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Table updated successfully",
    table,
  });
});

// Delete a table
const deleteTable = asyncHandler(async (req, res) => {
  const { tableId } = req.body;

  if (!tableId) {
    return res.status(200).json({ statusCode: 201, success: false, message: "Missing tableId" });
  }

  const deleted = await Table.findOneAndDelete({ tableId });

  if (!deleted) {
    return res.status(200).json({ statusCode: 201, success: false, message: "Table not found" });
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
