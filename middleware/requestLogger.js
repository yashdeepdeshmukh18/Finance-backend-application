const logger = require("../utils/logger");

/**
 * requestLogger — logs every incoming HTTP request.
 *
 * Logs: method, path, status code, response time, and user ID if authenticated.
 * The response-time logging uses a "finish" event on the response stream,
 * which fires after headers are flushed — accurate even for streaming responses.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const userId = req.user ? req.user._id : "unauthenticated";
    logger.info(
      `${req.method} ${req.originalUrl} → ${res.statusCode} | ${duration}ms | user: ${userId}`
    );
  });

  next();
};

module.exports = requestLogger;
