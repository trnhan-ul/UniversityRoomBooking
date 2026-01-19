const Room = require("../models/Room");
const Equipment = require("../models/Equipment");
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

    // Fetch equipment for each room
    const roomsWithEquipment = await Promise.all(
      rooms.map(async (room) => {
        const equipment = await Equipment.find({ 
          room_id: room._id, 
          status: 'WORKING' 
        });
        
        // Convert equipment to simple array of names (lowercase for matching frontend)
        const equipmentNames = equipment.map(eq => {
          const name = eq.name.toLowerCase();
          if (name.includes('projector')) return 'projector';
          if (name.includes('air conditioning') || name.includes('ac')) return 'ac';
          if (name.includes('whiteboard')) return 'whiteboard';
          if (name.includes('computer') || name.includes('workstation')) return 'computer';
          if (name.includes('natural light') || name.includes('window')) return 'natural_light';
          return name.replace(/\s+/g, '_');
        });

        return {
          ...room.toObject(),
          equipment: [...new Set(equipmentNames)] // Remove duplicates
        };
      })
    );

    res.status(200).json({
      success: true,
      data: roomsWithEquipment,
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

    // Fetch equipment for the room
    const equipment = await Equipment.find({ 
      room_id: room._id, 
      status: 'WORKING' 
    });
    
    // Convert equipment to simple array of names
    const equipmentNames = equipment.map(eq => {
      const name = eq.name.toLowerCase();
      if (name.includes('projector')) return 'projector';
      if (name.includes('air conditioning') || name.includes('ac')) return 'ac';
      if (name.includes('whiteboard')) return 'whiteboard';
      if (name.includes('computer') || name.includes('workstation')) return 'computer';
      if (name.includes('natural light') || name.includes('window')) return 'natural_light';
      return name.replace(/\s+/g, '_');
    });

    res.status(200).json({
      success: true,
      data: {
        ...room.toObject(),
        equipment: [...new Set(equipmentNames)]
      },
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
