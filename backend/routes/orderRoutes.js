const express = require("express");
const router = express.Router();
const {
  createGuestOrder,
  getOrdersBySeller,
  verifyOrderByCode,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware"); // your existing auth

// Guest
router.post("/guest", createGuestOrder);

// Seller
router.post("/seller", protect, getOrdersBySeller);
router.post("/verify/:orderCode", protect, verifyOrderByCode);

module.exports = router;
