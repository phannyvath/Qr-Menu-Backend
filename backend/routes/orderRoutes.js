const express = require("express");
const router = express.Router();
const {
  createGuestOrder,
  getOrdersByWebID,
  verifyOrderByCode,
} = require("../controllers/orderController");

// Swagger: Guest places an order
/**
 * @swagger
 * /api/orders/guest:
 *   post:
 *     tags: [Orders]
 *     summary: Place a guest order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webID
 *               - items
 *             properties:
 *               webID:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - foodId
 *                     - quantity
 *                   properties:
 *                     foodId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Order placed successfully
 */
router.post("/guest", createGuestOrder);

// Swagger: Seller retrieves orders by webID (from request body)
/**
 * @swagger
 * /api/orders/seller:
 *   post:
 *     tags: [Orders]
 *     summary: Get all orders by seller (using webID in body)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webID
 *             properties:
 *               webID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.post("/seller", getOrdersByWebID); // No protect middleware needed if not using token

// Swagger: Verify order by code
/**
 * @swagger
 * /api/orders/verify:
 *   post:
 *     tags: [Orders]
 *     summary: Verify order by orderCode and webID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderCode
 *               - webID
 *             properties:
 *               orderCode:
 *                 type: string
 *               webID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order verified
 */
router.post("/verify", verifyOrderByCode);

module.exports = router;
