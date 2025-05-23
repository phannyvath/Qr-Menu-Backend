const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategoryStatus,
  updateCategory,
} = require("../controllers/categoryController");
const { protect } = require("../middleware/authMiddleware");

// Create category
router.post("/create", protect, createCategory);

// Get categories
router.post("/", protect, getCategories);

// Update category details
router.post("/update", protect, updateCategory);

// Update status only
router.post("/status", protect, updateCategoryStatus);

// Delete category
router.post("/delete", protect, deleteCategory);

module.exports = router;
