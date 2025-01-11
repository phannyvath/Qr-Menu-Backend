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
router.post("/", protect, createFood);

// Route for getting all foods (no authentication required)
router.get("/", getFoods);

// Route for getting foods by a specific owner (requires authentication)
router.get("/owner/:ownerID", protect, getFoodsByOwner);

// Route for getting foods by category (no authentication required)
router.get("/by-category", getFoodsByCategory);

// Route for updating food (requires authentication)
router.put("/:id", protect, updateFood);

// Route for deleting food (requires authentication)
router.delete("/:id", protect, deleteFood);

module.exports = router;
