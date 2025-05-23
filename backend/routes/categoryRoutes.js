const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect } = require("../middleware/authMiddleware");

// Category Routes
router.post("/", protect, createCategory);
router.get("/", protect, getCategories);
router.post("/delete", protect, deleteCategory);

module.exports = router;
