const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
  },
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be at least 0'],
    default: 1
  },
  status: {
    type: String,
    enum: ['WORKING', 'BROKEN', 'MAINTENANCE'],
    default: 'WORKING',
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
equipmentSchema.index({ room_id: 1 });
equipmentSchema.index({ status: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);
