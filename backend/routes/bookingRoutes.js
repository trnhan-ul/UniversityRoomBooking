const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const bookingController = require("../controllers/bookingController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// POST /api/bookings/recurring -> create recurring bookings
router.post("/recurring", authenticate, authorizeRoles(["STUDENT", "LECTURER"]), bookingController.createRecurringBooking);

// POST /api/bookings -> create new booking
router.post("/", authenticate, authorizeRoles(["STUDENT", "LECTURER"]), async (req, res) => {
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

// GET /api/bookings/report - booking report with filters (Admin/Facility Manager)
router.get(
  "/report",
  authenticate,
  authorizeRoles(["FACILITY_MANAGER", "ADMINISTRATOR"]),
  bookingController.getBookingReport,
);

// GET /api/bookings/statistics - booking statistics (Admin/Facility Manager)
router.get(
  "/statistics",
  authenticate,
  authorizeRoles(["FACILITY_MANAGER", "ADMINISTRATOR"]),
  bookingController.getBookingStatistics,
);

// PATCH /api/bookings/recurring/:recurrence_id/approve - MUST be before /:id/approve
router.patch(
  "/recurring/:recurrence_id/approve",
  authenticate,
  authorizeRoles(["FACILITY_MANAGER", "ADMINISTRATOR"]),
  bookingController.approveRecurringGroup,
);

// PATCH /api/bookings/recurring/:recurrence_id/reject - MUST be before /:id/reject
router.patch(
  "/recurring/:recurrence_id/reject",
  authenticate,
  authorizeRoles(["FACILITY_MANAGER", "ADMINISTRATOR"]),
  bookingController.rejectRecurringGroup,
);

router.patch(
  "/:id/approve",
  authenticate,
  authorizeRoles(["FACILITY_MANAGER", "ADMINISTRATOR"]),
  bookingController.approveBooking,
);

router.patch(
  "/:id/reject",
  authenticate,
  authorizeRoles(["FACILITY_MANAGER", "ADMINISTRATOR"]),
  bookingController.rejectBooking,
);

// PATCH /api/bookings/:id/cancel - cancel booking (User)
router.patch("/:id/cancel", authenticate, bookingController.cancelBooking);

// GET /api/bookings/:id/extend-options - get available extension time slots (User, booking owner, ongoing)
router.get("/:id/extend-options", authenticate, bookingController.getExtendOptions);

// PATCH /api/bookings/:id/extend - extend booking end time (User, booking owner, ongoing)
router.patch("/:id/extend", authenticate, bookingController.extendBooking);

// PATCH /api/bookings/:id - update booking (User) - MUST be last
router.patch("/:id", authenticate, bookingController.updateBooking);

module.exports = router;
