// routes/featureRoutes.js
const express = require("express");
const router = express.Router();
const { getAllFeatures, createFeature, updateFeature, deleteFeature } = require("../controllers/featureController");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/features:
 *   post:
 *     tags: [Features]
 *     responses:
 *       200:
 *         description: List of features
 */
// Public route to fetch all features
router.post("/", getAllFeatures);

/**
 * @swagger
 * /api/features/create:
 *   post:
 *     tags: [Features]
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
 *         description: Feature created
 */
// Protected routes
router.post("/create", protect, createFeature);
router.post("/update/:id", protect, updateFeature);
router.post("/delete/:id", protect, deleteFeature);

/**
 * @swagger
 * /api/features/update/{id}:
 *   post:
 *     tags: [Features]
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
 *         description: Feature updated
 */
/**
 * @swagger
 * /api/features/delete/{id}:
 *   post:
 *     tags: [Features]
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
 *         description: Feature deleted
 */

module.exports = router;
