const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Setting = require("../models/Setting");
const { Notification } = require("../models");
const { sendApprovalEmail } = require("../services/emailService");
const mongoose = require("mongoose");

// UC14 - Create Booking
const createBooking = async (req, res) => {
  try {
    const { room_id, date, start_time, end_time, purpose } = req.body;

    // Validate required fields
    if (!room_id || !date || !start_time || !end_time || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate room exists and available
    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.status !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "Room is not available",
      });
    }

    // Validate date is not in the past
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot book room in the past",
      });
    }

    // Validate time format and logic
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format. Use HH:mm",
      });
    }

    const [startHour, startMin] = start_time.split(":").map(Number);
    const [endHour, endMin] = end_time.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Validate working hours
    const workingHoursStart = await Setting.findOne({ key: 'WORKING_HOURS_START' });
    const workingHoursEnd = await Setting.findOne({ key: 'WORKING_HOURS_END' });
    
    if (workingHoursStart && workingHoursEnd) {
      const whStart = workingHoursStart.value;
      const whEnd = workingHoursEnd.value;
      
      if (start_time < whStart || end_time > whEnd) {
        return res.status(400).json({
          success: false,
          message: `Bookings must be within working hours (${whStart} - ${whEnd})`,
        });
      }
    }

    // Check for booking conflicts
    const conflicts = await Booking.find({
      room_id,
      date: bookingDate,
      status: { $in: ["PENDING", "APPROVED"] },
      $or: [
        {
          start_time: { $lt: end_time },
          end_time: { $gt: start_time },
        },
      ],
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    // Create booking
    const booking = await Booking.create({
      user_id: req.user._id,
      room_id,
      date: bookingDate,
      start_time,
      end_time,
      purpose,
      status: "PENDING",
    });

    // Populate room info
    await booking.populate("room_id", "room_name room_code location capacity");

    res.status(201).json({
      success: true,
      data: booking,
      message: "Booking created successfully. Waiting for approval.",
    });
  } catch (error) {
    console.error("createBooking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const getPendingBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const matchStage = { $match: { status: "PENDING" } };
    const lookupRoom = {
      $lookup: {
        from: "rooms",
        localField: "room_id",
        foreignField: "_id",
        as: "room",
      },
    };
    const lookupUser = {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    };
    const unwindRoom = {
      $unwind: { path: "$room", preserveNullAndEmptyArrays: true },
    };
    const unwindUser = {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    };

    const sortStage = { $sort: { date: 1, "room.name": 1, start_time: 1 } };

    const facetStage = {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    };

    const pipeline = [
      matchStage,
      lookupRoom,
      unwindRoom,
      lookupUser,
      unwindUser,
      sortStage,
      facetStage,
    ];

    const results = await Booking.aggregate(pipeline);
    const bookings = (results[0] && results[0].data) || [];
    const total =
      (results[0] &&
        results[0].totalCount[0] &&
        results[0].totalCount[0].count) ||
      0;

    res.status(200).json({
      success: true,
      data: { bookings, pagination: { total, page, limit } },
    });
  } catch (error) {
    console.error("getPendingBookings error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Manager view booking detail by id
const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking id" });
    }
    const booking = await Booking.findById(bookingId)
      .populate("user_id", "full_name email phone_number")
      .populate("room_id", "name location capacity");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error("getBookingById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const approveBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(bookingId)
      .populate("user_id", "full_name email")
      .populate("room_id", "name location");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "PENDING") {
      return res
        .status(400)
        .json({ success: false, message: "Booking is not pending" });
    }

    const conflicts = await Booking.findOne({
      _id: { $ne: bookingId },
      room_id: booking.room_id,
      date: booking.date,
      status: "APPROVED",
      $or: [
        {
          start_time: { $lt: booking.end_time },
          end_time: { $gt: booking.start_time },
        },
      ],
    });

    if (conflicts) {
      return res.status(409).json({
        success: false,
        message: "Time slot conflict with another approved booking",
      });
    }

    booking.status = "APPROVED";
    booking.approved_at = new Date();
    booking.approved_by = req.user._id;

    await booking.save();
    await booking.populate("user_id", "full_name email");
    await booking.populate("room_id", "name location");

    await Notification.create({
      user_id: booking.user_id._id,
      title: "Booking Approved",
      message: `Your booking for ${booking.room_id.name} on ${booking.date.toDateString()} (${booking.start_time}-${booking.end_time}) has been approved.`,
      type: "BOOKING",
      target_type: "Booking",
      target_id: booking._id,
      is_read: false
    });

    await sendApprovalEmail(
      booking.user_id,
      booking,
      booking.room_id,
      "APPROVED",
      null,
    );

    res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      data: booking,
    });
  } catch (error) {
    console.error("approveBooking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking id" });
    }

    const { reject_reason } = req.body;

    if (!reject_reason || reject_reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason required (min 10 characters)",
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("user_id", "full_name email")
      .populate("room_id", "name location");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "PENDING") {
      return res
        .status(400)
        .json({ success: false, message: "Booking is not pending" });
    }

    booking.status = "REJECTED";
    booking.reject_reason = reject_reason.trim();
    booking.approved_at = new Date();
    booking.approved_by = req.user._id;

    await booking.save();
    await booking.populate("user_id", "full_name email");
    await booking.populate("room_id", "name location");

    await Notification.create({
      user_id: booking.user_id._id,
      title: "Booking Rejected",
      message: `Your booking for ${booking.room_id.name} has been rejected. Reason: ${booking.reject_reason}`,
      type: "BOOKING",
      target_type: "Booking",
      target_id: booking._id,
      is_read: false
    });

    await sendApprovalEmail(
      booking.user_id,
      booking,
      booking.room_id,
      "REJECTED",
      booking.reject_reason,
    );

    res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      data: booking,
    });
  } catch (error) {
    console.error("rejectBooking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const getMyBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const statusFilter = req.query.status;
    const timeFilter = req.query.time;

    const query = { user_id: req.user._id };

    if (statusFilter) {
      const statuses = statusFilter.split(",").map((s) => s.toUpperCase());
      query.status = { $in: statuses };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (timeFilter === "upcoming") {
      query.date = { $gte: today };
    } else if (timeFilter === "past") {
      query.date = { $lt: today };
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("room_id", "name location capacity")
        .sort({ date: -1, start_time: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: { bookings, pagination: { total, page, limit } },
    });
  } catch (error) {
    console.error("getMyBookings error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// User cancel their own booking
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: not your booking" });
    }

    if (!["PENDING", "APPROVED"].includes(booking.status)) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot cancel this booking" });
    }

    booking.status = "CANCELLED";
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("cancelBooking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// User update their own booking
const updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Check ownership
    if (booking.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: not your booking" });
    }

    // Only PENDING bookings can be updated
    if (booking.status !== "PENDING") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only pending bookings can be updated",
        });
    }

    const { room_id, date, start_time, end_time, purpose } = req.body;

    // Validate time format and logic if provided
    if (start_time || end_time) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      const newStartTime = start_time || booking.start_time;
      const newEndTime = end_time || booking.end_time;

      if (!timeRegex.test(newStartTime) || !timeRegex.test(newEndTime)) {
        return res.status(400).json({
          success: false,
          message: "Invalid time format. Use HH:mm",
        });
      }

      const [startHour, startMin] = newStartTime.split(":").map(Number);
      const [endHour, endMin] = newEndTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        return res.status(400).json({
          success: false,
          message: "End time must be after start time",
        });
      }
    }

    // Validate date is not in the past if provided
    if (date) {
      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (bookingDate < today) {
        return res.status(400).json({
          success: false,
          message: "Cannot book room in the past",
        });
      }
    }

    // Check if room exists if room_id is being changed
    if (room_id && room_id !== booking.room_id.toString()) {
      const room = await Room.findById(room_id);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      if (room.status !== "AVAILABLE") {
        return res.status(400).json({
          success: false,
          message: "Room is not available",
        });
      }
    }

    // Check for booking conflicts
    const checkRoomId = room_id || booking.room_id;
    const checkDate = date ? new Date(date) : booking.date;
    const checkStartTime = start_time || booking.start_time;
    const checkEndTime = end_time || booking.end_time;

    const conflicts = await Booking.find({
      _id: { $ne: bookingId }, // Exclude current booking
      room_id: checkRoomId,
      date: checkDate,
      status: { $in: ["PENDING", "APPROVED"] },
      $or: [
        {
          start_time: { $lt: checkEndTime },
          end_time: { $gt: checkStartTime },
        },
      ],
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    // Update booking fields
    if (room_id) booking.room_id = room_id;
    if (date) booking.date = new Date(date);
    if (start_time) booking.start_time = start_time;
    if (end_time) booking.end_time = end_time;
    if (purpose) booking.purpose = purpose;

    await booking.save();
    await booking.populate("room_id", "room_name room_code location capacity");
    await booking.populate("user_id", "full_name email phone_number");

    res.status(200).json({
      success: true,
      data: booking,
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("updateBooking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get booking statistics
const getBookingStatistics = async (req, res) => {
  try {
    // Get today's date at the start of the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count approved bookings today
    const approvedToday = await Booking.countDocuments({
      status: "APPROVED",
      updated_at: { $gte: today, $lt: tomorrow },
    });

    // Count pending bookings
    const pendingTotal = await Booking.countDocuments({
      status: "PENDING",
    });

    // Count approved bookings
    const approvedTotal = await Booking.countDocuments({
      status: "APPROVED",
    });

    res.status(200).json({
      success: true,
      data: {
        approvedToday,
        pendingTotal,
        approvedTotal,
      },
    });
  } catch (error) {
    console.error("getBookingStatistics error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get booking report with filters
const getBookingReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      status,
      room_id,
      groupBy = "date", // date, room, status
    } = req.query;

    // Build match query
    const matchQuery = {};

    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (status) {
      matchQuery.status = status;
    }

    if (room_id) {
      matchQuery.room = new mongoose.Types.ObjectId(room_id);
    }

    // Aggregate based on groupBy parameter
    let groupStage = {};
    let sortStage = {};

    switch (groupBy) {
      case "date":
        groupStage = {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
          },
        };
        sortStage = { "_id.date": 1 };
        break;

      case "room":
        groupStage = {
          _id: {
            room_id: "$room",
            room_name: "$room_details.name",
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
          },
        };
        sortStage = { total: -1 };
        break;

      case "status":
        groupStage = {
          _id: { status: "$status" },
          total: { $sum: 1 },
          bookings: {
            $push: {
              booking_id: "$_id",
              room_name: "$room_details.name",
              date: "$date",
              user_name: "$user_details.full_name",
            },
          },
        };
        sortStage = { total: -1 };
        break;

      default:
        groupStage = {
          _id: null,
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
          },
        };
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "room_details",
        },
      },
      { $unwind: { path: "$room_details", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user_details",
        },
      },
      { $unwind: { path: "$user_details", preserveNullAndEmptyArrays: true } },
      { $group: groupStage },
    ];

    if (Object.keys(sortStage).length > 0) {
      pipeline.push({ $sort: sortStage });
    }

    const reportData = await Booking.aggregate(pipeline);

    // Get summary statistics
    const summary = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        groupBy,
        report: reportData,
        summary: summary.length > 0 ? summary[0] : null,
        filters: { startDate, endDate, status, room_id },
      },
    });
  } catch (error) {
    console.error("getBookingReport error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createBooking,
  getPendingBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  getMyBookings,
  cancelBooking,
  updateBooking,
  getBookingStatistics,
  getBookingReport,
};
