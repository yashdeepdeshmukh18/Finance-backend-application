const {register : registerService, login : loginService} = require("../services/authService");
const { success, error } = require("../utils/apiResponse");

/**
 * Controllers are intentionally thin — they handle HTTP concerns only
 * (parsing request, calling service, formatting response).
 * All business logic lives in the service layer.
 */

const register = async (req, res) => {
  try {
    const result = await registerService(req.body);
    return success(res, {
      data: result,
      message: "Account created successfully.",
      status: 201,
    });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginService(req.body);
    return success(res, { data: result, message: "Login successful." });
  } catch (err) {
    return error(res, { message: err.message, status: err.status || 500 });
  }
};

// req.user is populated by the authenticate middleware.
const getMe = async (req, res) => {
  return success(res, { data: req.user.toPublic(), message: "Profile fetched." });
};

module.exports = { register, login, getMe };
