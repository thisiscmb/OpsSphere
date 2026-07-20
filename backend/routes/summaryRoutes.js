const express = require("express");
const router = express.Router();
const summaryController = require("../controllers/summaryController");

// GET /api/summary/date/:date
router.get("/date/:date", summaryController.getSummaryByDate);
router.get("/", summaryController.getAllSummaries);
router.get("/user/:username", summaryController.getSummariesByUsername);
router.post("/add-segment", summaryController.addSegment);
module.exports = router;
