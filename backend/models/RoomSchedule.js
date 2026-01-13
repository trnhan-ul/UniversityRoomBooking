const mongoose = require('mongoose');

const roomScheduleSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  start_time: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide valid time format (HH:mm)']
  },
  end_time: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide valid time format (HH:mm)']
  },
  status: {
    type: String,
    enum: ['BLOCKED', 'MAINTENANCE', 'EVENT'],
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true
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
roomScheduleSchema.index({ room_id: 1 });
roomScheduleSchema.index({ date: 1 });
roomScheduleSchema.index({ status: 1 });
roomScheduleSchema.index({ room_id: 1, date: 1 });

module.exports = mongoose.model('RoomSchedule', roomScheduleSchema);
