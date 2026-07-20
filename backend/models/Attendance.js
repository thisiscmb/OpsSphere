// models/Attendance.js
const mongoose = require("mongoose");

const SegmentSchema = new mongoose.Schema({
  Type: { type: String },
  Location: { type: String },
  DeviceType: { type: String },
  Description: { type: String },
  ProjectDescription: { type: String },
  LogIn: { type: Date },
  LogOut: { type: Date }
}, { _id: false });

const AttendanceSchema = new mongoose.Schema({
  UserName: { type: String, required: true },
  Date: { type: Date, required: true },
  Segments: { type: [SegmentSchema], default: [] }
}, { collection: "Attendance" });

module.exports = mongoose.model("Attendance", AttendanceSchema);
