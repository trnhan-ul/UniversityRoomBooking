// Server entry point
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Fail fast if JWT secret is not provided
if (!process.env.JWT_SECRET) {
  console.error("Environment variable JWT_SECRET is required");
  process.exit(1);
}

// Generate unique server instance ID on startup
// This ensures old tokens become invalid when server restarts
global.SERVER_START_TIME = Date.now();
console.log(
  "Server instance started at:",
  new Date(global.SERVER_START_TIME).toISOString(),
);

const connectDB = require("./config/db");
const initDatabase = require("./config/init");
const { startBookingReminderJob } = require("./jobs/bookingReminder");

const app = express();

// Connect to database and initialize
connectDB()
  .then(async () => {
    await initDatabase();
    console.log("Database initialized");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: "50mb" })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const settingRoutes = require("./routes/settingRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const facilityIssueRoutes = require("./routes/facilityIssueRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/facility-issues", facilityIssueRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "University Room Booking System API",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

  // Start cron job for booking reminders
  startBookingReminderJob();
});
