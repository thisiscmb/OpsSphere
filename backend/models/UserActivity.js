// models/UserActivity.js
const mongoose = require("mongoose");

const UserActivitySchema = new mongoose.Schema(
  {
    UserName: { type: String, required: true },
    Date: { type: Date, required: true },

    // 🔥 NUMERIC AGGREGATION ONLY
    productiveMs: { type: Number, default: 0 },
    idleMs: { type: Number, default: 0 }
  },
  { collection: "UserActivities" }
);

// 🔑 CRITICAL INDEX
UserActivitySchema.index({ UserName: 1, Date: 1 }, { unique: true });

module.exports = mongoose.model("UserActivity", UserActivitySchema);
