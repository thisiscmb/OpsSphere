const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: "*",          // allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allow common methods
    allowedHeaders: ["Content-Type", "Authorization"],    // allow headers
  })
); // enable pre-flight for all routes
app.use(express.json());

// Routes
app.use('/api/summary', require('./routes/summaryRoutes'));
// app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/auth', require('./routes/adminRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use("/health", require("./routes/health"));
app.use("/api/tracking", require("./routes/timetrackerRoutes"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0' ,() => console.log(`Server running on port ${PORT}`));
