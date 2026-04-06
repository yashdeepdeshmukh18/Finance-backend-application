const logger = require("../utils/logger");

/**
 * errorHandler — Express global error-handling middleware.
 *
 * Must be registered LAST in app.js (after all routes).
 * Catches errors passed via next(err) from any route or middleware.
 *
 * Handles:
 *  - Mongoose CastError (invalid ObjectId → 400)
 *  - Mongoose ValidationError (schema validation → 400)
 *  - Mongoose duplicate key error (unique constraint → 409)
 *  - JWT errors (→ 401) — though these are also caught in authMiddleware
 *  - Generic errors
 */
const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose: invalid ObjectId format
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  // Mongoose: schema validation failed
  if (err.name === "ValidationError") {
    status = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = "Validation failed";
    return res.status(status).json({ success: false, message, errors });
  }

  // MongoDB: unique index violation
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already exists.`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token.";
  }

  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token has expired.";
  }

  // Log server errors (5xx) — not client errors (4xx)
  if (status >= 500) {
    logger.error(`[${status}] ${req.method} ${req.originalUrl} — ${message}`, err.stack);
  }

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
