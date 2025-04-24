// routes/featureRoutes.js
const express = require("express");
const router = express.Router();
const { getAllFeatures, createFeature, updateFeature, deleteFeature } = require("../controllers/featureController");
const { protect } = require("../middleware/authMiddleware");

// Public route to fetch all features
router.get("/", getAllFeatures);

// Protected routes
router.post("/", protect, createFeature);
router.put("/:id", protect, updateFeature);
router.delete("/:id", protect, deleteFeature);

module.exports = router;
