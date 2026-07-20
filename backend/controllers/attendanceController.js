const Attendance = require("../models/Attendance");

// Add a new segment (check-in/check-out)
exports.addSegment = async (req, res) => {
  try {
    const { UserName, Date: dateStr, Segment } = req.body;
    if (!UserName || !dateStr || !Segment) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    console.log("log in done");
    const date = new Date(dateStr);
    let attendance = await Attendance.findOne({ UserName, Date: date });

    if (!attendance) {
      attendance = new Attendance({ UserName, Date: date, Segments: [Segment] });
    } else {
      attendance.Segments.push(Segment);
    }

    await attendance.save();
    res.status(200).json({error:false,message:"Log-in successful"});
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.checkoutSegment = async (req, res) => {
  try {
    const { UserName, Date: dateStr, DeviceType, LogOut, Description } = req.body;
    if (!UserName || !dateStr || !DeviceType || !LogOut) {
      console.log(req.body);
      console.log("First condition");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const date = new Date(dateStr);

    // Find the attendance document for the user and date
    const attendance = await Attendance.findOne({ UserName, Date: date });
    if (!attendance) {
      console.log("Attendance not found");
      return res.status(404).json({ error: "Attendance record not found" });
    }

    // Find the segment for this device without CheckOut
    const segment = attendance.Segments.find(
      seg => seg.DeviceType === DeviceType && !seg.LogOut
    );

    if (!segment) {
      return res.status(400).json({ error: "No open session found for this device" });
    }
    console.log(req.body);
    segment.LogOut = new Date(LogOut);
    if (segment.Description)
    {segment.Description = Description;}

    await attendance.save();

    res.status(200).json({
      message: "Logout successfully",
      Segment: segment
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};
// Get attendance by user and optional date
exports.getByUser = async (req, res) => {
  try {
    const username = req.params.username;
    const { date } = req.query;
    let query = { UserName: username };
    if (date) query.Date = new Date(date);

    const attendance = await Attendance.find(query);
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Get all attendance records for a specific date
exports.getAllAttendance = async (req, res) => {
  try {
    const { date } = req.params;
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }
    // Find attendance records for the given date
    const records = await Attendance.find({ Date: new Date(date) });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
