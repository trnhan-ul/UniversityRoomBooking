const Equipment = require('../models/Equipment');
const Room = require('../models/Room');
const mongoose = require('mongoose');

// Get all equipment with optional filters
exports.getAllEquipment = async (req, res) => {
  try {
    const { room_id, status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (room_id) filter.room_id = room_id;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const equipment = await Equipment.find(filter)
      .populate('room_id', 'room_name room_code location')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Equipment.countDocuments(filter);

    res.json({
      success: true,
      data: equipment,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Get equipment by room ID
exports.getEquipmentByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID'
      });
    }

    const equipment = await Equipment.find({ room_id: roomId })
      .populate('room_id', 'room_name room_code location')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Error fetching equipment by room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Get single equipment by ID
exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID'
      });
    }

    const equipment = await Equipment.findById(id)
      .populate('room_id', 'room_name room_code location capacity')
      .populate('created_by', 'name email')
      .populate('updated_by', 'name email');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Create new equipment
exports.createEquipment = async (req, res) => {
  try {
    const { room_id, name, quantity, status, description } = req.body;

    // Validate required fields
    if (!room_id || !name) {
      return res.status(400).json({
        success: false,
        message: 'Room and equipment name are required'
      });
    }

    // Validate room exists
    if (!mongoose.Types.ObjectId.isValid(room_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID'
      });
    }

    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Create equipment
    const equipment = new Equipment({
      room_id,
      name,
      quantity: quantity || 1,
      status: status || 'WORKING',
      description: description || '',
      created_by: req.user.id,
      updated_by: req.user.id
    });

    await equipment.save();

    // Populate the equipment before sending response
    await equipment.populate('room_id', 'room_name room_code location');
    await equipment.populate('created_by', 'name email');

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create equipment',
      error: error.message
    });
  }
};

// Update equipment
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_id, name, quantity, status, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID'
      });
    }

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // If room_id is being updated, validate it
    if (room_id && room_id !== equipment.room_id.toString()) {
      if (!mongoose.Types.ObjectId.isValid(room_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid room ID'
        });
      }

      const room = await Room.findById(room_id);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }
      equipment.room_id = room_id;
    }

    // Update fields
    if (name) equipment.name = name;
    if (quantity !== undefined) equipment.quantity = quantity;
    if (status) equipment.status = status;
    if (description !== undefined) equipment.description = description;
    equipment.updated_by = req.user.id;

    await equipment.save();

    // Populate before sending response
    await equipment.populate('room_id', 'room_name room_code location');
    await equipment.populate('updated_by', 'name email');

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update equipment',
      error: error.message
    });
  }
};

// Delete equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid equipment ID'
      });
    }

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    await Equipment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete equipment',
      error: error.message
    });
  }
};
