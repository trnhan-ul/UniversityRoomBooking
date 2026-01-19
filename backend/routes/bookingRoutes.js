const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const bookingController = require("../controllers/bookingController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// POST /api/bookings -> create new booking
router.post("/", authenticate, async (req, res) => {
  try {
    const { room_id, date, start_time, end_time, purpose } = req.body;

    const booking = await Booking.create({
      user_id: req.user._id,
      room_id,
      date: new Date(date),
      start_time,
      end_time,
      purpose: purpose.trim(),
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/bookings/my-bookings
router.get("/my-bookings", authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.user._id })
      .populate("room_id", "room_name room_code location")
      .sort({ date: -1 });

    res.json({ success: true, data: { bookings } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings/pending - pending bookings with pagination (Admin/Facility Manager)
router.get(
  "/pending",
  authenticate,
  authorizeRoles(["FACILITY_MANAGER", "ADMINISTRATOR"]),
  bookingController.getPendingBookings,
);

module.exports = router;
