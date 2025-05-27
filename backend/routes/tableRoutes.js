const express = require("express");
const router = express.Router();
const {
  createTable,
  getAllTables,
  updateTable,
  deleteTable,
} = require("../controllers/tableController");

router.post("/create", createTable);    // Create table with optional status/people
router.post("/", getAllTables);          // Get all tables
router.post("/update", updateTable);     // Update status/people
router.post("/delete", deleteTable);  // Delete table

module.exports = router;
