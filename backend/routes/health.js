const express = require("express");
const router = express.Router();

// Simple health check
router.get("/", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

module.exports = router;
