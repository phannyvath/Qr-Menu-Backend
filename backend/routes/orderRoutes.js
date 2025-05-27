const express = require("express");
const router = express.Router();
const { order, getOrders } = require("../controllers/orderController");

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
router.post("/order", order);

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

module.exports = router;
