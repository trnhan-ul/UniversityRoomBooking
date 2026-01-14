const Room = require("../models/Room");
const mongoose = require("mongoose");

// Get all rooms with filters
const getRooms = async (req, res) => {
  try {
    const { status, location, capacity } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    const rooms = await Room.find(query).sort({ room_code: 1 });

    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error("getRooms error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get room by ID
const getRoomById = async (req, res) => {
  try {
    const roomId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("getRoomById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getRooms,
  getRoomById,
};
