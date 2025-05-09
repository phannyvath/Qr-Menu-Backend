const express = require("express");
const router = express.Router();
const {
  createFood,
  getFoods,
  getFoodsByOwner,
  getFoodsByWebID,
  updateFoodStatus,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");
const { protect } = require("../middleware/authMiddleware");

// Protected routes
router.post("/", protect, createFood);
router.get("/", getFoods);
router.get("/owner", protect, getFoodsByOwner);
router.post("/by-webid", getFoodsByWebID);
router.patch("/status/:id", protect, updateFoodStatus);
router.put("/:id", protect, updateFood);
router.delete("/:id", protect, deleteFood);

module.exports = router;
