const express = require("express");
const router = express.Router();
const { createPayment, confirmPayment } = require("../controllers/paymentController");

/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     summary: Initiate a payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Payment initiated
 */
router.post("/create", createPayment); // Route to initiate payment

/**
 * @swagger
 * /api/payment/confirm:
 *   post:
 *     summary: Confirm payment status
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Payment confirmed
 */
router.post("/confirm", confirmPayment); // Route to confirm payment status

module.exports = router;
