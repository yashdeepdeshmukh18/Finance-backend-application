const User = require("../models/User");
const { parsePagination, buildMeta } = require("../utils/pagination");
const logger = require("../utils/logger");

// returns all users.
const getAllUsers = async (query) => {
  const { page, limit, skip } = parsePagination(query);

  // Build optional filters
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map((u) => u.toPublic()),
    meta: buildMeta({ total, page, limit }),
  };
};


const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error("User not found.");
    err.status = 404;
    throw err;
  }
  return user.toPublic();
};


//   allows admin to change role and/or status.
const updateUser = async (id, updates, adminId) => {
  // admin should not delete their own account
  if (updates.status === "inactive" && id === adminId.toString()) {
    const err = new Error("You cannot deactivate your own account.");
    err.status = 400;
    throw err;
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const err = new Error("User not found.");
    err.status = 404;
    throw err;
  }

  logger.info(`Admin ${adminId} updated user ${id}: ${JSON.stringify(updates)}`);

  return user.toPublic();
};

module.exports = { getAllUsers, getUserById, updateUser };
