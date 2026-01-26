const Room = require("../models/Room");
const Equipment = require("../models/Equipment");
const RoomImage = require("../models/RoomImage");
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
        
        // Fetch images for the room
        const images = await RoomImage.find({ room_id: room._id }).sort({ is_cover: -1 });
        
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
          equipment: [...new Set(equipmentNames)], // Remove duplicates
          images: images.map(img => img.image_url)
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
    
    // Fetch images for the room
    const images = await RoomImage.find({ room_id: room._id }).sort({ is_cover: -1 });
    
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
        equipment: [...new Set(equipmentNames)],
        images: images.map(img => img.image_url)
      },
    });
  } catch (error) {
    console.error("getRoomById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create new room (Admin only)
const createRoom = async (req, res) => {
  try {
    const { room_code, room_name, capacity, location, description, status, equipment, images } = req.body;

    // Validation
    if (!room_code || !room_name || !capacity || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: room_code, room_name, capacity, location",
      });
    }

    // Check if room code already exists
    const existingRoom = await Room.findOne({ room_code: room_code.toUpperCase() });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Room code already exists",
      });
    }

    // Create room
    const room = await Room.create({
      room_code: room_code.toUpperCase(),
      room_name,
      capacity,
      location,
      description: description || '',
      status: status || 'AVAILABLE',
      created_by: req.user.id,
    });

    // Create equipment if provided
    if (equipment && Array.isArray(equipment) && equipment.length > 0) {
      const equipmentDocs = equipment.map(eq => ({
        room_id: room._id,
        name: eq,
        status: 'WORKING',
        created_by: req.user.id,
      }));
      await Equipment.insertMany(equipmentDocs);
    }

    // Create room images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      console.log('Creating room images, count:', images.length);
      console.log('First image URL length:', images[0]?.length);
      const imageDocs = images.map((imageUrl, index) => ({
        room_id: room._id,
        image_url: imageUrl,
        is_cover: index === 0, // First image is cover
        uploaded_by: req.user.id,
      }));
      const savedImages = await RoomImage.insertMany(imageDocs);
      console.log('Images saved successfully:', savedImages.length);
    } else {
      console.log('No images provided or images is not an array');
    }

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    console.error("createRoom error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update room (Admin only)
const updateRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { room_code, room_name, capacity, location, description, status, equipment, images } = req.body;

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

    // Check if room code is being changed and if it already exists
    if (room_code && room_code.toUpperCase() !== room.room_code) {
      const existingRoom = await Room.findOne({ room_code: room_code.toUpperCase() });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: "Room code already exists",
        });
      }
    }

    // Update room
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      {
        room_code: room_code?.toUpperCase() || room.room_code,
        room_name: room_name || room.room_name,
        capacity: capacity || room.capacity,
        location: location || room.location,
        description: description !== undefined ? description : room.description,
        status: status || room.status,
        updated_by: req.user.id,
      },
      { new: true, runValidators: true }
    );

    // Update equipment if provided
    if (equipment && Array.isArray(equipment)) {
      // Remove old equipment
      await Equipment.deleteMany({ room_id: roomId });
      
      // Add new equipment
      if (equipment.length > 0) {
        const equipmentDocs = equipment.map(eq => ({
          room_id: roomId,
          name: eq,
          status: 'WORKING',
          created_by: req.user.id,
        }));
        await Equipment.insertMany(equipmentDocs);
      }
    }

    // Update images if provided
    if (images && Array.isArray(images)) {
      // Remove old images
      await RoomImage.deleteMany({ room_id: roomId });
      
      // Add new images
      if (images.length > 0) {
        const imageDocs = images.map((img, index) => ({
          room_id: roomId,
          image_url: img,
          is_cover: index === 0, // First image is cover
          uploaded_by: req.user.id,
        }));
        await RoomImage.insertMany(imageDocs);
      }
    }

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: updatedRoom,
    });
  } catch (error) {
    console.error("updateRoom error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete room (Admin only)
const deleteRoom = async (req, res) => {
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

    // Delete associated equipment
    await Equipment.deleteMany({ room_id: roomId });

    // Delete room
    await Room.findByIdAndDelete(roomId);

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("deleteRoom error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
