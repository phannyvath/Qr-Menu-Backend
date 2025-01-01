const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword } = require('../controllers/authController');

// Check if the imported functions are valid
console.log(registerUser, loginUser, forgotPassword);  // Add this to debug

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Forgot password route
router.post('/forgot-password', forgotPassword);

module.exports = router;
