// models/DailySummary.js
const mongoose = require("mongoose");

const DailySummarySchema = new mongoose.Schema(
  {
    UserName: { type: String, required: true },
    Date: { type: Date, required: true },

    // 🔥 NUMERIC FIELDS (HOT PATH)
    ProductiveMs: { type: Number, default: 0 },
    IdleMs: { type: Number, default: 0 },

    // Session metadata
    TrackingStart: { type: Date },
    TrackingEnd: { type: Date },
    Description: { type: String }
  },
  { collection: "DailySummaries" }
);

// 🔑 CRITICAL INDEX
DailySummarySchema.index({ UserName: 1, Date: 1 }, { unique: true });

module.exports = mongoose.model("DailySummary", DailySummarySchema);
