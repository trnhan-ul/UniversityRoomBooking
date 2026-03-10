const mongoose = require('mongoose');

const facilityIssueSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking is required']
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
  },
  reported_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  issue_type: {
    type: String,
    enum: ['EQUIPMENT_DAMAGE', 'FACILITY_DAMAGE', 'CLEANLINESS', 'SAFETY', 'OTHER'],
    required: [true, 'Issue type is required']
  },
  equipment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    default: null
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
    required: true
  },
  status: {
    type: String,
    enum: ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'REPORTED',
    required: true
  },
  images: [{
    type: String, // URL or base64 string for images
    maxlength: [5000000, 'Image size too large']
  }],
  location: {
    type: String,
    trim: true,
    default: '' // Specific location within the room (e.g., "Front desk", "Back corner")
  },
  admin_notes: {
    type: String,
    trim: true,
    default: ''
  },
  resolved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolved_at: {
    type: Date,
    default: null
  },
  resolution_notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for efficient queries
facilityIssueSchema.index({ booking_id: 1 });
facilityIssueSchema.index({ room_id: 1 });
facilityIssueSchema.index({ reported_by: 1 });
facilityIssueSchema.index({ status: 1 });
facilityIssueSchema.index({ severity: 1 });
facilityIssueSchema.index({ created_at: -1 });

// Virtual to check if issue is open
facilityIssueSchema.virtual('is_open').get(function() {
  return !['RESOLVED', 'CLOSED'].includes(this.status);
});

module.exports = mongoose.model('FacilityIssue', facilityIssueSchema);
