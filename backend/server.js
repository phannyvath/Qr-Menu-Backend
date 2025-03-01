const express = require("express");
const colors = require("colors"); // To style console logs
const dotenv = require("dotenv").config(); // Load environment variables
const { errorHandler } = require("./middleware/errorMiddleware"); // Custom error handler
const connectDB = require("./config/db"); // Database connection
const cors = require("cors"); // Import the cors package
const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Initialize express
const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://qr-menus.vercel.app", 
  "http://localhost:5173/"
  // // Allow localhost:3000
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Reject the request
      }
    },
    methods: "GET,POST,PUT,DELETE,OPTIONS", // Allow specific HTTP methods
    allowedHeaders: "Content-Type,Authorization", // Allow specific headers
  })
);

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use("/api/auth", require("./routes/authRoutes")); // Authentication routes
app.use("/api/foods", require("./routes/foodRoutes")); // Food routes

// Custom error handler middleware
app.use(errorHandler);

// Root route for testing server status
app.get("/", (req, res) => {
  res.send({ message: "Welcome to the API", status: "Running" });
});

// Start the server
app.listen(port, () =>
  console.log(`Server started on port ${port}`.brightGreen)
);
