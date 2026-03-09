const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.recipient_type === 'INDIVIDUAL';
    }
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['BOOKING', 'SYSTEM', 'REMINDER', 'FACILITY_ISSUE', 'FACILITY_ISSUE_UPDATE'],
    required: true
  },
  // Đối tượng nhận thông báo
  recipient_type: {
    type: String,
    enum: ['INDIVIDUAL', 'ALL_USERS'],
    default: 'INDIVIDUAL'
  },
  // Cho INDIVIDUAL: dùng is_read
  // Cho ALL_USERS: dùng read_by array
  is_read: {
    type: Boolean,
    default: false
  },
  read_by: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: 'User'
  },
  target_type: {
    type: String,
    enum: ['Booking', 'Room', 'User', 'RoomSchedule', 'FacilityIssue'],
    default: null
  },
  target_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Indexes
notificationSchema.index({ user_id: 1 });
notificationSchema.index({ is_read: 1 });
notificationSchema.index({ created_at: -1 });
notificationSchema.index({ user_id: 1, is_read: 1 });
notificationSchema.index({ recipient_type: 1 });
notificationSchema.index({ recipient_type: 1, created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
