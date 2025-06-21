const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv").config();
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 5000;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Connect to the database
connectDB();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory'.green);
}

// Initialize express
const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://qr-menus.vercel.app",
  "http://localhost:5173",
  "https://nhamey-order.vercel.app",
  "https://nhamey.vercel.app",
  "http://localhost:5001",
  "https://qr-menu-backend-hxlj.onrender.com"
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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/foods", require("./routes/foodRoutes"));
app.use("/api/features", require("./routes/featureRoutes"));
app.use("/api", require("./routes/orderRoutes")); // Your order routes
app.use("/api/payment", require("./routes/paymentRoutes")); // New payment routes
app.use("/api/categories", require("./routes/categoryRoutes")); // ✅ Add this line
app.use("/api/tables", require("./routes/tableRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/report", require("./routes/reportRoutes"));

// Serve uploads directory
app.use('/uploads', express.static(__dirname + '/uploads'));

// Ping endpoint to keep server awake
app.get("/ping", (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`Ping received at ${timestamp}`.cyan);
  res.status(200).json({ 
    message: "Server is awake!", 
    timestamp,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Custom error handler middleware
app.use(errorHandler);

// Root route for testing server status
app.get("/", (req, res) => {
  res.send({ message: "Welcome to the API", status: "Running" });
});

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QR Menu API',
      version: '1.0.0',
      description: 'API documentation for QR Menu Backend',
    },
    servers: [
      { url: process.env.BASE_URL || 'http://localhost:' + port },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./backend/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`.brightGreen);
  
  // Start the ping job to keep server awake
  startPingJob();
});

// Function to ping the server every 10 minutes
function startPingJob() {
  const pingInterval = 10 * 60 * 1000; // 10 minutes in milliseconds
  const serverUrl = process.env.BASE_URL || `http://localhost:${port}`;
  
  console.log(`Starting ping job to keep server awake at ${serverUrl}`.yellow);
  
  // Ping immediately when server starts
  pingServer(serverUrl);
  
  // Set up interval to ping every 10 minutes
  setInterval(() => {
    pingServer(serverUrl);
  }, pingInterval);
}

// Function to ping the server
async function pingServer(serverUrl) {
  try {
    const response = await fetch(`${serverUrl}/ping`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Server pinged successfully at ${new Date().toISOString()}`.green);
    } else {
      console.log(`❌ Ping failed with status: ${response.status}`.red);
    }
  } catch (error) {
    console.log(`❌ Ping error: ${error.message}`.red);
  }
}
