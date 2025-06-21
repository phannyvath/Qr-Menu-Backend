// routes/featureRoutes.js
const express = require("express");
const router = express.Router();
const { getAllFeatures, createFeature, updateFeature, deleteFeature, uploadImage } = require("../controllers/featureController");
const { protect } = require("../middleware/authMiddleware");
const multer = require('multer');
const path = require('path');

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

// Set up multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Image upload route
router.post('/upload/image', upload.single('image'), uploadImage);

module.exports = router;
