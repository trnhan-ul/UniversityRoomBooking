const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// Lấy danh sách booking đang ở trạng thái PENDING (cho Manager xem)
// Sắp xếp theo date asc, sau đó theo room.name asc
const getPendingBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    // Sử dụng aggregation để lookup room và user, rồi sort theo date và room.name
    const matchStage = { $match: { status: 'PENDING' } };
    const lookupRoom = {
      $lookup: {
        from: 'rooms',
        localField: 'room_id',
        foreignField: '_id',
        as: 'room'
      }
    };
    const lookupUser = {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user'
      }
    };
    const unwindRoom = { $unwind: { path: '$room', preserveNullAndEmptyArrays: true } };
    const unwindUser = { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } };

    const sortStage = { $sort: { date: 1, 'room.name': 1, start_time: 1 } };

    const facetStage = {
      $facet: {
        data: [ { $skip: skip }, { $limit: limit } ],
        totalCount: [ { $count: 'count' } ]
      }
    };

    const pipeline = [matchStage, lookupRoom, unwindRoom, lookupUser, unwindUser, sortStage, facetStage];

    const results = await Booking.aggregate(pipeline);
    const bookings = (results[0] && results[0].data) || [];
    const total = (results[0] && results[0].totalCount[0] && results[0].totalCount[0].count) || 0;

    res.status(200).json({ success: true, data: { bookings, pagination: { total, page, limit } } });
  } catch (error) {
    console.error('getPendingBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Manager view booking detail by id
const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }
    const booking = await Booking.findById(bookingId)
      .populate('user_id', 'full_name email phone_number')
      .populate('room_id', 'name location capacity');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Manager approve or reject booking
const approveBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }
    const { action, reject_reason } = req.body; // action: 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Booking is not pending' });
    }

    if (action === 'APPROVE') {
      booking.status = 'APPROVED';
      booking.approved_at = new Date();
      booking.approved_by = req.user ? req.user._id : null;
    } else {
      booking.status = 'REJECTED';
      booking.reject_reason = reject_reason || null;
      booking.approved_at = new Date();
      booking.approved_by = req.user ? req.user._id : null;
    }

    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('approveBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getPendingBookings,
  getBookingById,
  approveBooking
};
