const express = require("express");
const router = express.Router();
const {
  createFood,
  getFoods,
  getFoodsByOwner,
  getFoodsByWebID,
  updateFood,
  updateFoodStatus,
  deleteFood,
} = require("../controllers/foodController");
const { protect } = require("../middleware/authMiddleware");

// Create and list foods
router.post("/", protect, createFood);
router.get("/", getFoods);

// Owner & public view
router.post("/owner", protect, getFoodsByOwner);
router.post("/by-webid", getFoodsByWebID);

// Public food status endpoint (no authentication required)
router.get("/status", getFoodsByWebID);

// Update operations via payload
router.post("/update", protect, updateFood);
router.post("/status", protect, updateFoodStatus);
router.post("/delete", protect, deleteFood);

module.exports = router;
