const {
  getAllUsers: getAllUsersService,
  getUserById: getUserByIdService,
  updateUser: updateUserService,
} = require("../services/userService");
const { success, error } = require("../utils/apiResponse");

const getAllUsers = async (req, res) => {
  try {
    const result = await getAllUsersService(req.query);
    return success(res, {
      data: result.users,
      meta: result.meta,
      message: "Users fetched successfully.",
    });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await getUserByIdService(req.params.id);
    return success(res, { data: user, message: "User fetched successfully." });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await updateUserService(req.params.id, req.body, req.user._id);
    return success(res, { data: user, message: "User updated successfully." });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

module.exports = { getAllUsers, getUserById, updateUser };
