const express = require("express");
const router = express.Router();

const {register, login, getMe} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { validate, registerSchema, loginSchema } = require("../validators");


router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

router.get("/me", authenticate, getMe);

module.exports = router;
