const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// GET /api/rooms - Get all rooms (authenticated users)
router.get("/", authenticate, roomController.getRooms);

// GET /api/rooms/usage-report - Room usage statistics (MUST be before /:id)
router.get(
  "/usage-report",
  authenticate,
  authorizeRoles("ADMINISTRATOR"),
  roomController.getRoomUsageReport,
);

// GET /api/rooms/:id - Get room by ID
router.get("/:id", authenticate, roomController.getRoomById);

// POST /api/rooms - Create new room (Admin/Facility Manager only)
router.post(
  "/",
  authenticate,
  authorizeRoles("FACILITY_MANAGER"),
  roomController.createRoom,
);

// PUT /api/rooms/:id - Update room (Admin/Facility Manager only)
router.put(
  "/:id",
  authenticate,
  authorizeRoles("FACILITY_MANAGER"),
  roomController.updateRoom,
);

// PUT /api/rooms/:id/images - Update room images only (Admin/Facility Manager only)
router.put(
  "/:id/images",
  authenticate,
  authorizeRoles("FACILITY_MANAGER"),
  roomController.updateRoomImages,
);

// DELETE /api/rooms/:id - Delete room (Facility Manager only)
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("FACILITY_MANAGER"),
  roomController.deleteRoom,
);

router.post(
  "/block",
  authenticate,
  authorizeRoles("FACILITY_MANAGER"),
  roomController.blockTimeSlot,
);

router.delete(
  "/unblock/:schedule_id",
  authenticate,
  authorizeRoles("FACILITY_MANAGER"),
  roomController.unblockTimeSlot,
);

module.exports = router;
