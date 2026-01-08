const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room_code: {
    type: String,
    required: [true, 'Room code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  room_name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'UNAVAILABLE'],
    default: 'AVAILABLE',
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
roomSchema.index({ room_code: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ location: 1 });

module.exports = mongoose.model('Room', roomSchema);
