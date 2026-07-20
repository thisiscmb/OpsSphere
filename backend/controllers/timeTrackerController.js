const DailySummary = require("../models/DailySummary");
const UserActivity = require("../models/UserActivity");

/**
 * Normalize date to IST day (00:00:00)
 */
const getISTDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Convert milliseconds → HH:mm:ss
 * ⚠️ USED ONLY FOR UI / REPORTS (NOT HOT PATH)
 */
const msToTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

/**
 * POST /api/tracking/start
 */
exports.startTracking = async (req, res) => {
  try {
    const { UserName, LoginTime } = req.body;

    if (!UserName || !LoginTime) {
      return res.status(400).json({ error: "UserName and LoginTime are required" });
    }

    const username = UserName.toLowerCase();
    const loginTime = new Date(LoginTime);
    const today = getISTDate(loginTime);

    await DailySummary.updateOne(
      { UserName: username, Date: today },
      {
        $setOnInsert: {
          UserName: username,
          Date: today,
          ProductiveMs: 0,
          IdleMs: 0
        },
        $set: {
          TrackingStart: loginTime,
          TrackingEnd: null
        }
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("startTracking:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

/**
 * POST /api/tracking/stop
 */
exports.stopTracking = async (req, res) => {
  try {
    const { UserName, LogoutTime, Description } = req.body;

    if (!UserName || !LogoutTime) {
      return res.status(400).json({ error: "UserName and LogoutTime are required" });
    }

    const username = UserName.toLowerCase();
    const logoutTime = new Date(LogoutTime);
    const today = getISTDate(logoutTime);

    await DailySummary.updateOne(
      { UserName: username, Date: today },
      {
        $set: {
          TrackingEnd: logoutTime,
          Description: Description || null
        }
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("stopTracking:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

/**
 * POST /api/tracking/save-activity
 * 🔥 HOT PATH (CALLED EVERY FEW SECONDS)
 */
exports.saveActivity = async (req, res) => {
  try {
    const { UserName, StartTime, EndTime, IsIdle } = req.body;

    if (!UserName || !StartTime || !EndTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const username = UserName.toLowerCase();
    const start = new Date(StartTime);
    const end = new Date(EndTime);
    const today = getISTDate(start);

    const durationMs = end - start;

    // 🔐 SAFETY GUARD (CRITICAL)
    // Ignore abnormal gaps (sleep / clock change / duplicate calls)
    if (durationMs <= 0 || durationMs > 5 * 60 * 1000) {
      return res.json({ success: true });
    }

    // 🔥 O(1) aggregation – NO ARRAYS
    await UserActivity.updateOne(
      { UserName: username, Date: today },
      {
        $inc: {
          productiveMs: IsIdle ? 0 : durationMs,
          idleMs: IsIdle ? durationMs : 0
        },
        $setOnInsert: {
          UserName: username,
          Date: today
        }
      },
      { upsert: true }
    );

    await DailySummary.updateOne(
      { UserName: username, Date: today },
      {
        $inc: {
          ProductiveMs: IsIdle ? 0 : durationMs,
          IdleMs: IsIdle ? durationMs : 0
        }
      }
    );

    // ⚠️ Do NOT return heavy objects here
    res.json({ success: true });
  } catch (err) {
    console.error("saveActivity:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

/**
 * GET /api/tracking/current-session/:username
 * (Dashboard / UI only – NOT POLLED)
 */
exports.getCurrentSession = async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const today = getISTDate(new Date());

    const summary = await DailySummary.findOne(
      { UserName: username, Date: today },
      {
        ProductiveMs: 1,
        IdleMs: 1,
        TrackingStart: 1,
        TrackingEnd: 1
      }
    ).lean();

    if (!summary) {
      return res.status(404).json({ error: "No session found" });
    }

    res.json({
      productiveMs: summary.ProductiveMs || 0,
      idleMs: summary.IdleMs || 0,
      productiveTime: msToTime(summary.ProductiveMs || 0),
      idleTime: msToTime(summary.IdleMs || 0),
      trackingStart: summary.TrackingStart,
      isActive: summary.TrackingStart && !summary.TrackingEnd
    });
  } catch (err) {
    console.error("getCurrentSession:", err);
    res.status(500).json({ error: "Server Error" });
  }
};
