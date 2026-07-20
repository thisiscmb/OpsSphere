const express = require("express");
const router = express.Router();

// Simple health check
router.get("/local", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
router.get("/", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "OpsSphere Backend"
    });
});
module.exports = router;
