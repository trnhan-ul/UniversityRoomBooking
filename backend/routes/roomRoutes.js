const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { authenticate } = require("../middleware/auth");

// GET /api/rooms - Get all rooms (authenticated users)
router.get("/", authenticate, roomController.getRooms);

// GET /api/rooms/:id - Get room by ID
router.get("/:id", authenticate, roomController.getRoomById);

module.exports = router;
