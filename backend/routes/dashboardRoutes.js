const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// GET /api/dashboard/stats - Admin & Facility Manager only
router.get(
  "/stats",
  authenticate,
  authorizeRoles("ADMINISTRATOR"),
  getDashboardStats,
);

module.exports = router;
