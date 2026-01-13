const mongoose = require('mongoose');

const roomImageSchema = new mongoose.Schema({
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
  },
  image_url: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  is_cover: {
    type: Boolean,
    default: false
  },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: 'uploaded_at', updatedAt: false }
});

// Indexes
roomImageSchema.index({ room_id: 1 });
roomImageSchema.index({ is_cover: 1 });

// Đảm bảo chỉ có 1 ảnh cover cho mỗi room
roomImageSchema.pre('save', async function() {
  if (this.is_cover) {
    // Set tất cả ảnh khác của room này thành không phải cover
    await this.constructor.updateMany(
      { room_id: this.room_id, _id: { $ne: this._id } },
      { is_cover: false }
    );
  }
});

module.exports = mongoose.model('RoomImage', roomImageSchema);
