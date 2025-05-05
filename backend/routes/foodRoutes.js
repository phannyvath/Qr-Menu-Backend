const express = require("express");
const router = express.Router();
const {
  createFood,
  getFoods,
  getFoodsByOwner,
  updateFood,
  deleteFood,
  getFoodsByCategory, // Import the new controller
} = require("../controllers/foodController");
const { protect } = require("../middleware/authMiddleware");

// Route for creating food (requires authentication)
router.post("/create", protect, createFood);

// Route for getting all foods (no authentication required)
router.post("/all", getFoods);

// Route for getting foods by a specific owner (requires authentication)
router.post("/owner/:ownerID", protect, getFoodsByOwner);

// Route for getting foods by category (no authentication required)
router.post("/by-category", getFoodsByCategory);

// Route for updating food (requires authentication)
router.post("/update/:id", protect, updateFood);

// Route for deleting food (requires authentication)
router.post("/delete/:id", protect, deleteFood);

module.exports = router;
