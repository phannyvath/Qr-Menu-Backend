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

/**
 * @swagger
 * /api/foods:
 *   post:
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Food created
 *   get:
 *     tags: [Foods]
 *     responses:
 *       200:
 *         description: List of foods
 */
// Protected routes
router.post("/", protect, createFood);
router.post("/", getFoods);
router.post("/owner", protect, getFoodsByOwner);
router.post("/by-webid", getFoodsByWebID);
router.post("/status/:id", protect, updateFoodStatus);
router.post("/:id", protect, updateFood);
router.post("/:id", protect, deleteFood);

module.exports = router;
