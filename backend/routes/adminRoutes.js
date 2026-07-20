const express = require("express");
const Admin = require("../models/Admin");

const router = express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.json({ success: true, message: "Login successful", user: { username: admin.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Change password endpoint
router.post("/update-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ username });

    if (!admin || admin.password !== oldPassword) {
      return res.status(403).json({ success: false, message: "Old password is incorrect" });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;