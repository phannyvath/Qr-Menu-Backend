const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv").config();
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const cors = require("cors");
const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Initialize express
const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://qr-menus.vercel.app",
  "http://localhost:5173",
  "https://nhamey.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/foods", require("./routes/foodRoutes"));
app.use("/api/features", require("./routes/featureRoutes"));
app.use("/api/orders", require("./routes/orderRoutes")); // Your order routes
app.use("/api/payment", require("./routes/paymentRoutes")); // New payment routes

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
