const DailySummary = require("../models/DailySummary");
const { msToTime, timeToMs } = require("../utils/helper");

exports.getSummaryByDate = async (req, res) => {
  try {
    const dateStr = req.params.date; // e.g. "2025-10-06"
    const date = new Date(dateStr);

    // Calculate IST offset (UTC+5:30)
    const IST_OFFSET_MINUTES = 330;

    // Start and end of day in IST, then convert to UTC
    const startOfDayIST = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    startOfDayIST.setUTCMinutes(startOfDayIST.getUTCMinutes() - IST_OFFSET_MINUTES);

    const endOfDayIST = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
    endOfDayIST.setUTCMinutes(endOfDayIST.getUTCMinutes() - IST_OFFSET_MINUTES);

    console.log("Querying between (UTC):", startOfDayIST, endOfDayIST);

    const summaries = await DailySummary.find({
      Date: { $gte: startOfDayIST, $lte: endOfDayIST }
    });

    console.log("Summaries found:", summaries.length);

    const result = summaries.map(s => {
      const totalMs = timeToMs(s.ProductiveTime) + timeToMs(s.IdleTime);
      return {
        _id: s._id,
        UserName: s.UserName,
        Date: s.Date,
        ProductiveTime: s.ProductiveMs,
        IdleTime: s.IdleMs,
        IdlePeriods: s.IdlePeriods,
        TrackingStart: s.TrackingStart,
        TrackingEnd: s.TrackingEnd,
        TotalTime: msToTime(totalMs)
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getAllSummaries = async (req, res) => {
  try {
    const summaries = await DailySummary.find({});
    const result = summaries.map(s => {
      const totalMs = timeToMs(s.ProductiveTime) + timeToMs(s.IdleTime);
      return {
        _id: s._id,
        UserName: s.UserName,
        Date: s.Date,
        ProductiveTime: s.ProductiveTime,
        IdleTime: s.IdleTime,
        IdlePeriods: s.IdlePeriods,
        TrackingStart: s.TrackingStart,
        TrackingEnd: s.TrackingEnd,
        TotalTime: msToTime(totalMs)
      };
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getSummariesByUsername = async (req, res) => {
  try {
    const username = req.params.username;
    const { date } = req.query;  // optional query param

    let query = { UserName: username };

    if (date) {
      // Calculate IST offset (UTC+5:30)
      const IST_OFFSET_MINUTES = 330;
      const dateObj = new Date(date);

      // Start and end of day in IST, then convert to UTC
      const startOfDayIST = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 0, 0, 0, 0));
      startOfDayIST.setUTCMinutes(startOfDayIST.getUTCMinutes() - IST_OFFSET_MINUTES);

      const endOfDayIST = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 23, 59, 59, 999));
      endOfDayIST.setUTCMinutes(endOfDayIST.getUTCMinutes() - IST_OFFSET_MINUTES);

      query.Date = { $gte: startOfDayIST, $lte: endOfDayIST };
    }

    const summaries = await DailySummary.find(query);
    const result = summaries.map(s => {
      const totalMs = timeToMs(s.ProductiveTime) + timeToMs(s.IdleTime);
      return {
        _id: s._id,
        UserName: s.UserName,
        Date: s.Date,
        ProductiveTime: s.ProductiveTime,
        IdleTime: s.IdleTime,
        IdlePeriods: s.IdlePeriods,
        TrackingStart: s.TrackingStart,
        TrackingEnd: s.TrackingEnd,
        TotalTime: msToTime(totalMs)
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.addSegment = async (req, res) => {
  try {
    const { UserName, Date: dateStr, Segment } = req.body;
    if (!UserName || !dateStr || !Segment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const date = new Date(dateStr);

    // Find existing DailySummary
    let summary = await DailySummary.findOne({ UserName, Date: date });

    if (!summary) {
      // Create new DailySummary with the segment
      summary = new DailySummary({
        UserName,
        Date: date,
        Segments: [Segment],
        TotalProductiveTime: Segment.ProductiveTime || "00:00:00",
        TotalIdleTime: Segment.IdleTime || "00:00:00",
        TotalDuration: msToTime(
          timeToMs(Segment.ProductiveTime || "00:00:00") +
          timeToMs(Segment.IdleTime || "00:00:00")
        )
      });
    } else {
      // Push new segment
      summary.Segments.push(Segment);

      // Recalculate totals
      let totalProdMs = 0;
      let totalIdleMs = 0;

      summary.Segments.forEach(seg => {
        totalProdMs += timeToMs(seg.ProductiveTime || "00:00:00");
        totalIdleMs += timeToMs(seg.IdleTime || "00:00:00");
      });

      summary.TotalProductiveTime = msToTime(totalProdMs);
      summary.TotalIdleTime = msToTime(totalIdleMs);
      summary.TotalDuration = msToTime(totalProdMs + totalIdleMs);
    }

    await summary.save();

    res.status(200).json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};