const express = require("express");
const router = express.Router();
const { createPayment, confirmPayment } = require("../controllers/paymentController");

router.post("/create", createPayment); // Route to initiate payment
router.post("/confirm", confirmPayment); // Route to confirm payment status

module.exports = router;
