const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT'],
    required: [true, 'Action is required']
  },
  target_type: {
    type: String,
    enum: ['User', 'Room', 'Booking', 'Equipment', 'RoomSchedule', 'Setting'],
    required: [true, 'Target type is required']
  },
  target_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  ip_address: {
    type: String,
    trim: true,
    default: null
  },
  user_agent: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Indexes
auditLogSchema.index({ user_id: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ target_type: 1 });
auditLogSchema.index({ created_at: -1 });
auditLogSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
