const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { error } = require("../utils/apiResponse");
const logger = require("../utils/logger");

// Verifies JWT token and ataches user info to req.user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return error(res, { message: "Access denied. No token provided.", status: 401 });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Token has expired. Please log in again."
          : "Invalid token. Please log in again.";
      return error(res, { message, status: 401 });
    }

    // important so role/status changes take effect immediately
    const user = await User.findById(decoded.id).select("+status +role");

    if (!user) {
      return error(res, { message: "User no longer exists.", status: 401 });
    }

    // Business rule: inactive users cannot use the API even with a valid token
    if (user.status === "inactive") {
      return error(res, {
        message: "Your account has been deactivated. Contact an administrator.",
        status: 403,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error("Auth middleware error:", err.message);
    return error(res, { message: "Authentication failed.", status: 500 });
  }
};

module.exports = { authenticate };
