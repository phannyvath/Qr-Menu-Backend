const express = require("express");
const colors = require("colors"); // To style console logs
const dotenv = require("dotenv").config(); // Load environment variables
const { errorHandler } = require("./middleware/errorMiddleware"); // Custom error handler
const connectDB = require("./config/db"); // Database connection
const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Initialize express
const app = express();

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes (example auth route)
app.use("/api/auth", require("./routes/authRoutes"));

// Custom error handler middleware
app.use(errorHandler);

// Start the server
app.listen(port, () =>
  console.log(`Server started on port ${port}`.brightGreen)
);
