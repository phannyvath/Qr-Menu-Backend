const express = require("express");
const router = express.Router();
const {
  createFood,
  getFoods,
  getFoodsByOwner,
  getFoodsByCategory,
  updateFood,
  deleteFood,
  updateFoodStatus, // Import the new function for updating status
} = require("../controllers/foodController");

const { protect } = require("../middleware/authMiddleware");

// Route for creating food (requires authentication)
router.post("/create", protect, createFood);

// Route for getting all foods (no authentication required)
router.post("/all", getFoods);

// Route for getting foods by specific owner (requires authentication)
router.post("/owner/:ownerID", protect, getFoodsByOwner);

// Route for getting foods by category (no authentication required)
router.post("/by-category", getFoodsByCategory);

// Route for updating food (requires authentication)
router.post("/update/:id", protect, updateFood);

// Route for deleting food (requires authentication)
router.post("/delete/:id", protect, deleteFood);

// Route for updating food status (requires authentication)
router.post("/update-status/:id", protect, updateFoodStatus);

module.exports = router;
