const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const connectDB = require("./config/db");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recordRoutes = require("./routes/recordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// environment variables
require("dotenv").config();

const app = express();

// Connect Database
connectDB();

//  Security Middleware 
app.use(helmet()); // sets secure HTTP headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//  Body Parsing 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

//  Request Logging 
app.use(requestLogger);

//  Health Check 
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Finance Dashboard API is running.",
  });
});

//  API Routes 
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

//  404 Handler 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

//  Global Error Handler 
// Must be last — Express identifies error handlers by their 4-argument signature
app.use(errorHandler);

//  Start Server 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});

module.exports = app;
