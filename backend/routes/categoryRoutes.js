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

router.post("/", protect, createCategory);
router.get("/", protect, getCategories);
router.post("/delete", protect, deleteCategory);
router.post("/status", protect, updateCategoryStatus);
router.post("/update", protect, updateCategory);

module.exports = router;
