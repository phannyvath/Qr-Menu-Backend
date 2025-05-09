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
router.get("/", getFoods);

/**
 * @swagger
 * /api/foods/owner:
 *   get:
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of foods by owner
 */
router.get("/owner", protect, getFoodsByOwner);

/**
 * @swagger
 * /api/foods/by-webid:
 *   post:
 *     tags: [Foods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: List of foods by web ID
 */
router.post("/by-webid", getFoodsByWebID);

/**
 * @swagger
 * /api/foods/status/{id}:
 *   patch:
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Food status updated
 */
router.patch("/status/:id", protect, updateFoodStatus);

/**
 * @swagger
 * /api/foods/{id}:
 *   put:
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Food updated
 *   delete:
 *     tags: [Foods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food deleted
 */
router.put("/:id", protect, updateFood);
router.delete("/:id", protect, deleteFood);

module.exports = router;
