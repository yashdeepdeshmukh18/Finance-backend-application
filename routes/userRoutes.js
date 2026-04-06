const express = require("express");
const router = express.Router();

const {getAllUsers, getUserById, updateUser} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { validate, updateUserSchema } = require("../validators");


router.get("/", authenticate, allowRoles("admin"), getAllUsers);
router.get("/:id", authenticate, allowRoles("admin"), getUserById);
router.patch("/:id", authenticate, allowRoles("admin"), validate(updateUserSchema), updateUser);

module.exports = router;
