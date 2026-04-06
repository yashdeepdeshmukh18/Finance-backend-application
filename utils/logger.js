/**
 * Lightweight logger utility.
 *
 * Wraps console methods with timestamps and log levels.
 * In production you'd swap this for winston/pino — the interface stays the same.
 */

const timestamp = () => new Date().toISOString();

const logger = {
  info: (...args) => console.log(`[${timestamp()}] [INFO]`, ...args),
  warn: (...args) => console.warn(`[${timestamp()}] [WARN]`, ...args),
  error: (...args) => console.error(`[${timestamp()}] [ERROR]`, ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[${timestamp()}] [DEBUG]`, ...args);
    }
  },
};

module.exports = logger;
