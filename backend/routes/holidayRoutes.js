const express = require("express");
const router = express.Router();
const {
  createHoliday,
  getAllHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
  checkHoliday,
} = require("../controllers/holidayController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// Public route - anyone can check holidays
router.get("/check", checkHoliday);
router.get("/", getAllHolidays);
router.get("/:id", getHolidayById);

// Protected routes - only Facility Manager can manage holidays
router.post("/", authenticate, authorizeRoles("FACILITY_MANAGER"), createHoliday);
router.put("/:id", authenticate, authorizeRoles("FACILITY_MANAGER"), updateHoliday);
router.delete("/:id", authenticate, authorizeRoles("FACILITY_MANAGER"), deleteHoliday);

module.exports = router;
