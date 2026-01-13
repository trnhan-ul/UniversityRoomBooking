const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
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
  verified_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Indexes
emailVerificationSchema.index({ user_id: 1 });

module.exports = mongoose.model('EmailVerification', emailVerificationSchema);
