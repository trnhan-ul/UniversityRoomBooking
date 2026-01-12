const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Setting key is required'],
    unique: true,
    trim: true
  },
  value: {
    type: String,
    required: [true, 'Setting value is required']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  data_type: {
    type: String,
    enum: ['STRING', 'NUMBER', 'BOOLEAN', 'TIME'],
    default: 'STRING'
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

module.exports = mongoose.model('Setting', settingSchema);
