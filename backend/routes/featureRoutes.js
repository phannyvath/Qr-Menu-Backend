// routes/featureRoutes.js
const express = require("express");
const router = express.Router();
const { getAllFeatures, createFeature, updateFeature, deleteFeature } = require("../controllers/featureController");
const { protect } = require("../middleware/authMiddleware");

// Public route to fetch all features
router.post("/", getAllFeatures);

// Protected routes
router.post("/create", protect, createFeature);
router.post("/update/:id", protect, updateFeature);
router.post("/delete/:id", protect, deleteFeature);

module.exports = router;
