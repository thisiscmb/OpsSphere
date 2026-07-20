// routes/timeTrackerRoutes.js
const express = require("express");
const router = express.Router();
const timeTrackerController = require("../controllers/timeTrackerController");

// Start tracking session
router.post("/start", timeTrackerController.startTracking);

// Stop tracking session
router.post("/stop", timeTrackerController.stopTracking);

// Save activity (productive/idle session)
router.post("/save-activity", timeTrackerController.saveActivity);

// Check if auto-logout should happen
// router.post("/check-auto-logout", timeTrackerController.checkAutoLogout);

// // Check if early logout reason is required
// router.post("/check-early-logout", timeTrackerController.checkEarlyLogout);

// Get current session for a user
router.get("/current-session/:username", timeTrackerController.getCurrentSession);

module.exports = router;