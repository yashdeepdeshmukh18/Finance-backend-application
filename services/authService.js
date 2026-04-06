const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("An account with this email already exists.");
    err.status = 409;
    throw err;
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  logger.info(`New user registered: ${email} (role: ${role || "viewer"})`);

  return { user: user.toPublic(), token };
};


const login = async ({ email, password }) => {
  // Must manually select password, it has select:false on the schema
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    const err = new Error("Invalid email or password.");
    err.status = 401;
    throw err;
  }

  // inactive users cannot log in
  if (user.status === "inactive") {
    const err = new Error("Your account has been deactivated. Contact an administrator.");
    err.status = 403;
    throw err;
  }

  const token = generateToken(user._id);

  logger.info(`User logged in: ${email}`);

  return { user: user.toPublic(), token };
};

module.exports = { register, login };
