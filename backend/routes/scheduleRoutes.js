const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// GET /api/schedules/calendar - Get calendar data
router.get(
  "/calendar",
  authenticate,
  authorizeRoles("FACILITY_MANAGER"),
  scheduleController.getCalendarData,
);

module.exports = router;
