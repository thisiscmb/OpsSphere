const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

router.post("/log-in", attendanceController.addSegment);
router.post("/log-out", attendanceController.checkoutSegment);
router.get("/user/:username", attendanceController.getByUser);

// Get all attendance records
router.get("/date/:date", attendanceController.getAllAttendance);

module.exports = router;
