const Room = require("../models/Room");
const Equipment = require("../models/Equipment");
const RoomImage = require("../models/RoomImage");
const RoomSchedule = require("../models/RoomSchedule");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
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
    const { room_code, room_name, capacity, location, description, status, equipment } = req.body;

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

// Block Time Slot with Smart Hybrid Conflict Detection
const blockTimeSlot = async (req, res) => {
  try {
    const { room_id, date, start_time, end_time, status, reason, force } = req.body;

    // Validate required fields
    if (!room_id || !date || !start_time || !end_time || !status || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: room_id, date, start_time, end_time, status, reason'
      });
    }

    // Verify room exists
    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Validate time range
    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      room_id,
      date: new Date(date),
      status: { $in: ['APPROVED', 'PENDING'] },
      $or: [
        {
          start_time: { $lt: end_time },
          end_time: { $gt: start_time }
        }
      ]
    }).populate('user_id', 'full_name email');

    // Separate APPROVED and PENDING bookings
    const approvedBookings = overlappingBookings.filter(b => b.status === 'APPROVED');
    const pendingBookings = overlappingBookings.filter(b => b.status === 'PENDING');

    // HARD BLOCK: Cannot proceed if there are APPROVED bookings
    if (approvedBookings.length > 0) {
      return res.status(409).json({
        success: false,
        error_code: 'APPROVED_BOOKINGS_EXIST',
        message: 'Cannot block time slot - approved bookings exist',
        conflicts: {
          approved: approvedBookings.map(b => ({
            booking_id: b._id,
            user: b.user_id?.full_name,
            email: b.user_id?.email,
            time: `${b.start_time} - ${b.end_time}`,
            purpose: b.purpose,
            status: b.status
          })),
          can_override: false
        }
      });
    }

    // SOFT WARNING: Can proceed with force=true if only PENDING bookings
    if (pendingBookings.length > 0 && !force) {
      return res.status(409).json({
        success: false,
        error_code: 'PENDING_BOOKINGS_EXIST',
        message: 'Pending bookings will be automatically rejected if you proceed',
        conflicts: {
          pending: pendingBookings.map(b => ({
            booking_id: b._id,
            user: b.user_id?.full_name,
            email: b.user_id?.email,
            time: `${b.start_time} - ${b.end_time}`,
            purpose: b.purpose,
            status: b.status
          })),
          can_override: true,
          action_required: 'Set force=true to proceed and auto-reject pending bookings'
        }
      });
    }

    // If force=true, reject all pending bookings
    if (pendingBookings.length > 0 && force) {
      for (const booking of pendingBookings) {
        booking.status = 'REJECTED';
        booking.rejection_reason = `Time slot blocked for ${status.toLowerCase()}: ${reason}`;
        await booking.save();

        // Create notification for rejected booking
        await Notification.create({
          user_id: booking.user_id._id,
          type: 'BOOKING_REJECTED',
          title: 'Booking Request Rejected',
          message: `Your booking for ${room.room_code} on ${new Date(date).toLocaleDateString()} has been rejected due to schedule blocking.`,
          related_booking: booking._id,
          is_read: false
        });
      }
    }

    // Check for existing schedule blocks at same time
    const existingSchedule = await RoomSchedule.findOne({
      room_id,
      date: new Date(date),
      $or: [
        {
          start_time: { $lt: end_time },
          end_time: { $gt: start_time }
        }
      ]
    });

    if (existingSchedule) {
      return res.status(409).json({
        success: false,
        message: 'A schedule block already exists for this time slot',
        existing_block: {
          status: existingSchedule.status,
          time: `${existingSchedule.start_time} - ${existingSchedule.end_time}`,
          reason: existingSchedule.reason
        }
      });
    }

    // Create the schedule block
    const schedule = await RoomSchedule.create({
      room_id,
      date: new Date(date),
      start_time,
      end_time,
      status, // BLOCKED, MAINTENANCE, EVENT
      reason,
      created_by: req.user._id
    });

    await schedule.populate('room_id', 'room_code room_name location');
    await schedule.populate('created_by', 'full_name email');

    res.status(201).json({
      success: true,
      message: `Time slot blocked successfully${pendingBookings.length > 0 ? ` (${pendingBookings.length} pending booking(s) rejected)` : ''}`,
      data: schedule,
      rejected_bookings: pendingBookings.length
    });

  } catch (error) {
    console.error('Block time slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block time slot',
      error: error.message
    });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  blockTimeSlot,
};
