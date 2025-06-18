const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getCurrentOrderForTable, updateOrderPaymentStatus, getPendingOrderCountByWebID } = require("../controllers/orderController");

/**
 * @swagger
 * /api/order:
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
 *               - tableId
 *               - items
 *             properties:
 *               webID:
 *                 type: string
 *               tableId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Order placed successfully
 */
router.post("/order", createOrder);

/**
 * @swagger
 * /api/getorder:
 *   post:
 *     tags: [Orders]
 *     summary: Get orders by webID or verify by orderCode
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
 *               orderCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Orders retrieved or verified
 */
router.post("/getorder", getOrders);
router.post("/getcurrentorder", getCurrentOrderForTable);

/**
 * @swagger
 * /api/order/payment-status:
 *   post:
 *     tags: [Orders]
 *     summary: Update order payment status and order status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderCode
 *               - paymentStatus
 *             properties:
 *               orderCode:
 *                 type: string
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed, refunded]
 *     responses:
 *       200:
 *         description: Order payment status updated successfully
 */
router.post("/payment-status", updateOrderPaymentStatus);

router.post("/pending-order-count", getPendingOrderCountByWebID);

module.exports = router;
