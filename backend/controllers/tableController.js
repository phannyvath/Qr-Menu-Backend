const asyncHandler = require("express-async-handler");
const Table = require("../models/tableModel");

// ✅ Create table
const createTable = asyncHandler(async (req, res) => {
  const { status = "normal", people = "" } = req.body;

  const table = await Table.create({ status, people });

  const tableObj = table.toObject();
  tableObj.tableId = tableObj._id;
  delete tableObj._id;
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

  const formatted = tables.map(table => {
    const obj = table.toObject();
    obj.tableId = obj._id;
    delete obj._id;
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

// ✅ Update table
const updateTable = asyncHandler(async (req, res) => {
  const { tableId, status, people } = req.body;

  if (!tableId) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing tableId",
    });
  }

  const table = await Table.findById(tableId);
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

  const tableObj = table.toObject();
  tableObj.tableId = tableObj._id;
  delete tableObj._id;
  delete tableObj.__v;

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Table updated successfully",
    table: tableObj,
  });
});

// ✅ Delete table
const deleteTable = asyncHandler(async (req, res) => {
  const { tableId } = req.body;

  if (!tableId) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Missing tableId",
    });
  }

  const deleted = await Table.findByIdAndDelete(tableId);
  if (!deleted) {
    return res.status(200).json({
      statusCode: 201,
      success: false,
      message: "Table not found",
    });
  }

  const deletedObj = deleted.toObject();
  deletedObj.tableId = deletedObj._id;
  delete deletedObj._id;
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
