const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expires_at: {
    type: Date,
    required: true,
    index: { expires: 0 }  // TTL index - auto delete when expires
  },
  is_used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Indexes
passwordResetSchema.index({ user_id: 1 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
