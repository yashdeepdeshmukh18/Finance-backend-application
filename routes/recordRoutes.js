const express = require("express");
const router = express.Router();

const {
  getRecords, 
  getRecordById, 
  createRecord, 
  updateRecord, 
  deleteRecord
  } = require("../controllers/recordController");
const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { validate, createRecordSchema, updateRecordSchema } = require("../validators");


router.get("/", authenticate, getRecords);
router.get("/:id", authenticate, getRecordById);


router.post("/", authenticate, allowRoles("admin"), validate(createRecordSchema), createRecord);
router.patch("/:id", authenticate, allowRoles("admin"), validate(updateRecordSchema), updateRecord);
router.delete("/:id", authenticate, allowRoles("admin"), deleteRecord);

module.exports = router;
