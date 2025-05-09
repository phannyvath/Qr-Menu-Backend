const express = require("express");
const router = express.Router();
const {
  createGuestOrder,
  getOrdersBySeller,
  verifyOrderByCode,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware"); // your existing auth

/**
 * @swagger
 * /api/orders/guest:
 *   post:
 *     summary: Create a guest order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Guest order created
 */
// Guest
router.post("/guest", createGuestOrder);

/**
 * @swagger
 * /api/orders/seller:
 *   post:
 *     summary: Get orders by seller
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Orders by seller
 */
// Seller
router.post("/seller", protect, getOrdersBySeller);
router.post("/verify/:orderCode", protect, verifyOrderByCode);

/**
 * @swagger
 * /api/orders/verify/{orderCode}:
 *   post:
 *     summary: Verify order by code
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderCode
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
 *         description: Order verified
 */

module.exports = router;
