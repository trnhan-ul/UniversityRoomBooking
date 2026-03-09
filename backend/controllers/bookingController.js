const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Setting = require("../models/Setting");
const { Notification, Holiday } = require("../models");
const { sendApprovalEmail } = require("../services/emailService");
const { logBookingAction } = require("../utils/auditLogger");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

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

    // Check if date is a holiday
    const checkDate = new Date(bookingDate);
    checkDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const holiday = await Holiday.findOne({
      date: {
        $gte: checkDate,
        $lt: endOfDay,
      },
    });

    if (holiday) {
      return res.status(400).json({
        success: false,
        message: `Cannot book room on ${holiday.name}`,
        holiday: {
          name: holiday.name,
          date: holiday.date,
          description: holiday.description,
        },
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
    const workingHoursStart = await Setting.findOne({
      key: "WORKING_HOURS_START",
    });
    const workingHoursEnd = await Setting.findOne({ key: "WORKING_HOURS_END" });

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

    // Generate QR code token for check-in
    booking.qr_code_token = uuidv4();
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
      is_read: false,
    });

    await sendApprovalEmail(
      booking.user_id,
      booking,
      booking.room_id,
      "APPROVED",
      null,
    );

    // Log the approval action
    await logBookingAction(
      req.user,
      "APPROVE",
      booking,
      `Approved booking for ${booking.room_id.name} on ${booking.date.toDateString()} (${booking.start_time}-${booking.end_time}) by ${booking.user_id.full_name}`,
      req,
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
      is_read: false,
    });

    await sendApprovalEmail(
      booking.user_id,
      booking,
      booking.room_id,
      "REJECTED",
      booking.reject_reason,
    );

    // Log the rejection action
    await logBookingAction(
      req.user,
      "REJECT",
      booking,
      `Rejected booking for ${booking.room_id.name} on ${booking.date.toDateString()} by ${booking.user_id.full_name}. Reason: ${booking.reject_reason}`,
      req,
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
        .populate("user_id", "full_name email phone_number")
        .populate("room_id", "room_name room_code location capacity")
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
      return res.status(400).json({
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

// Recurring Booking — thêm vào trước module.exports
const createRecurringBooking = async (req, res) => {
  try {
    const {
      room_id,
      start_date,
      end_date,
      start_time,
      end_time,
      purpose,
      recurrence_type,
    } = req.body;

    // 1. Validate required fields
    if (
      !room_id ||
      !start_date ||
      !end_date ||
      !start_time ||
      !end_time ||
      !purpose ||
      !recurrence_type
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // 2. Validate recurrence_type
    if (!["WEEKLY", "MONTHLY"].includes(recurrence_type)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "recurrence_type must be WEEKLY or MONTHLY",
        });
    }

    // 3. Validate dates
    const startD = new Date(start_date);
    const endD = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startD < today) {
      return res
        .status(400)
        .json({ success: false, message: "Start date cannot be in the past" });
    }
    if (endD <= startD) {
      return res
        .status(400)
        .json({ success: false, message: "End date must be after start date" });
    }
    if (endD - startD > 365 * 24 * 60 * 60 * 1000) {
      return res
        .status(400)
        .json({ success: false, message: "Date range cannot exceed 1 year" });
    }

    // 4. Validate time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid time format. Use HH:mm" });
    }
    const [sh, sm] = start_time.split(":").map(Number);
    const [eh, em] = end_time.split(":").map(Number);
    if (eh * 60 + em <= sh * 60 + sm) {
      return res
        .status(400)
        .json({ success: false, message: "End time must be after start time" });
    }

    // 5. Validate room
    const room = await Room.findById(room_id);
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    if (room.status !== "AVAILABLE") {
      return res
        .status(400)
        .json({ success: false, message: "Room is not available" });
    }

    // 6. Load working hours (1 query each)
    const [whStartSetting, whEndSetting] = await Promise.all([
      Setting.findOne({ key: "WORKING_HOURS_START" }),
      Setting.findOne({ key: "WORKING_HOURS_END" }),
    ]);
    const whStart = whStartSetting?.value;
    const whEnd = whEndSetting?.value;
    if (whStart && whEnd && (start_time < whStart || end_time > whEnd)) {
      return res.status(400).json({
        success: false,
        message: `Bookings must be within working hours (${whStart} - ${whEnd})`,
      });
    }

    // 7. Generate all dates in range
    const MAX_OCCURRENCES = recurrence_type === "WEEKLY" ? 52 : 12;
    const dates = [];
    let current = new Date(startD);
    while (current <= endD && dates.length < MAX_OCCURRENCES) {
      dates.push(new Date(current));
      if (recurrence_type === "WEEKLY") {
        current.setDate(current.getDate() + 7);
      } else {
        const dayOfMonth = startD.getDate();
        current.setMonth(current.getMonth() + 1);
        // Clamp cuoi thang (vd: Jan 31 -> Feb 28)
        const lastDay = new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          0,
        ).getDate();
        current.setDate(Math.min(dayOfMonth, lastDay));
      }
    }

    // 8. Load all holidays in range (1 query)
    const holidays = await Holiday.find({ date: { $gte: startD, $lte: endD } });
    const holidayMap = {};
    holidays.forEach((h) => {
      const d = new Date(h.date);
      d.setHours(0, 0, 0, 0);
      holidayMap[d.toISOString().split("T")[0]] = h.name;
    });

    // 9. Load all conflicts in range (1 query, filter in-memory)
    const existingBookings = await Booking.find({
      room_id,
      date: { $gte: startD, $lte: endD },
      status: { $in: ["PENDING", "APPROVED"] },
      $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }],
    });
    const conflictSet = new Set();
    existingBookings.forEach((b) => {
      const d = new Date(b.date);
      d.setHours(0, 0, 0, 0);
      conflictSet.add(d.toISOString().split("T")[0]);
    });

    // 10. Generate recurrence_id
    const recurrence_id = require("crypto").randomUUID();

    // 11. Process each date
    const created_docs = [];
    const failed = [];

    for (const d of dates) {
      const dateStr = d.toISOString().split("T")[0];

      if (d < today) {
        failed.push({ date: dateStr, reason: "Date is in the past" });
        continue;
      }
      if (holidayMap[dateStr]) {
        failed.push({
          date: dateStr,
          reason: `Holiday: ${holidayMap[dateStr]}`,
        });
        continue;
      }
      if (conflictSet.has(dateStr)) {
        failed.push({ date: dateStr, reason: "Time slot already booked" });
        continue;
      }

      created_docs.push({
        user_id: req.user._id,
        room_id,
        date: d,
        start_time,
        end_time,
        purpose,
        status: "PENDING",
        recurrence_id,
        recurrence_type,
      });
    }

    // 12. Bulk insert
    if (created_docs.length === 0) {
      return res.status(409).json({
        success: false,
        message:
          "No bookings could be created. All dates have conflicts or are invalid.",
        data: {
          total_attempted: dates.length,
          created_count: 0,
          failed_count: failed.length,
          failed,
        },
      });
    }

    const createdBookings = await Booking.insertMany(created_docs);

    // 13. Audit log (batch)
    for (const booking of createdBookings) {
      await logBookingAction(
        req.user,
        "CREATE",
        booking,
        `Recurring booking (${recurrence_type}) created for room ${room.room_name} on ${new Date(booking.date).toISOString().split("T")[0]}`,
        req,
      );
    }

    return res.status(201).json({
      success: true,
      message: `Created ${createdBookings.length} out of ${dates.length} bookings`,
      data: {
        recurrence_id,
        recurrence_type,
        total_attempted: dates.length,
        created_count: createdBookings.length,
        failed_count: failed.length,
        created: createdBookings,
        failed,
      },
    });
  } catch (error) {
    console.error("createRecurringBooking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const toMins = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toTime = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

// Get available extension options for an ongoing booking
const getExtendOptions = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id).populate(
      "room_id",
      "room_name location",
    );
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: not your booking" });
    }
    if (booking.status !== "APPROVED") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only approved bookings can be extended",
        });
    }

    // Check booking date = today
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const bookingDateStr = new Date(booking.date).toISOString().split("T")[0];
    if (bookingDateStr !== todayStr) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Can only extend bookings scheduled for today",
        });
    }

    // Check booking is currently ongoing
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const startMins = toMins(booking.start_time);
    const endMins = toMins(booking.end_time);
    if (nowMins < startMins || nowMins >= endMins) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Booking is not currently in progress",
        });
    }

    // Get working hours end
    const whEndSetting = await Setting.findOne({ key: "WORKING_HOURS_END" });
    const workEndMins = whEndSetting
      ? toMins(whEndSetting.value)
      : toMins("22:00");

    // Generate candidate slots: +30, +60, +90, +120 minutes from current end_time
    const STEP = 30;
    const MAX_EXTEND = 120;
    const candidates = [];
    for (let add = STEP; add <= MAX_EXTEND; add += STEP) {
      const candidateMins = endMins + add;
      if (candidateMins > workEndMins) break;
      candidates.push(candidateMins);
    }

    if (candidates.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          options: [],
          message: "No available extension — already at working hours limit",
        },
      });
    }

    // Check conflicts for range [current end_time, max candidate end_time]
    const maxCandidateTime = toTime(candidates[candidates.length - 1]);
    const conflicts = await Booking.find({
      _id: { $ne: booking._id },
      room_id: booking.room_id._id,
      date: booking.date,
      status: { $in: ["PENDING", "APPROVED"] },
      start_time: { $lt: maxCandidateTime },
      end_time: { $gt: booking.end_time },
    });

    // Find the earliest conflicting start
    let blockedFromMins = workEndMins;
    conflicts.forEach((c) => {
      const cStartMins = toMins(c.start_time);
      if (cStartMins < blockedFromMins) blockedFromMins = cStartMins;
    });

    // Only include candidates that don't exceed the blocked slot
    const availableOptions = candidates
      .filter((m) => m <= blockedFromMins)
      .map((m) => ({
        new_end_time: toTime(m),
        label: `+${m - endMins} min (until ${toTime(m)})`,
        extend_minutes: m - endMins,
      }));

    return res.status(200).json({
      success: true,
      data: {
        booking_id: booking._id,
        current_end_time: booking.end_time,
        work_end: toTime(workEndMins),
        options: availableOptions,
      },
    });
  } catch (error) {
    console.error("getExtendOptions error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Extend an approved ongoing booking's end time
const extendBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_end_time } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking id" });
    }
    if (!new_end_time) {
      return res
        .status(400)
        .json({ success: false, message: "new_end_time is required" });
    }
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(new_end_time)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid time format. Use HH:mm" });
    }

    const booking = await Booking.findById(id).populate("room_id", "room_name");
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: not your booking" });
    }
    if (booking.status !== "APPROVED") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only approved bookings can be extended",
        });
    }

    // Check today
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const bookingDateStr = new Date(booking.date).toISOString().split("T")[0];
    if (bookingDateStr !== todayStr) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Can only extend bookings scheduled for today",
        });
    }

    // Check ongoing
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const startMins = toMins(booking.start_time);
    const endMins = toMins(booking.end_time);
    if (nowMins < startMins || nowMins >= endMins) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Booking is not currently in progress",
        });
    }

    // new_end_time must be after current end_time
    const newEndMins = toMins(new_end_time);
    if (newEndMins <= endMins) {
      return res
        .status(400)
        .json({
          success: false,
          message: "New end time must be after current end time",
        });
    }

    // Check working hours
    const whEndSetting = await Setting.findOne({ key: "WORKING_HOURS_END" });
    if (whEndSetting && new_end_time > whEndSetting.value) {
      return res.status(400).json({
        success: false,
        message: `Cannot extend past working hours (${whEndSetting.value})`,
      });
    }

    // Check conflict: any booking on same room/date that overlaps [current_end, new_end]
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      room_id: booking.room_id._id,
      date: booking.date,
      status: { $in: ["PENDING", "APPROVED"] },
      start_time: { $lt: new_end_time },
      end_time: { $gt: booking.end_time },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Cannot extend: another booking starts at ${conflict.start_time}`,
      });
    }

    const oldEndTime = booking.end_time;
    booking.end_time = new_end_time;
    await booking.save();

    await logBookingAction(
      req.user,
      "UPDATE",
      booking,
      `Extended booking end time from ${oldEndTime} to ${new_end_time} for room ${booking.room_id.room_name}`,
      req,
    );

    return res.status(200).json({
      success: true,
      message: `Booking extended to ${new_end_time}`,
      data: booking,
    });
  } catch (error) {
    console.error("extendBooking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Approve all PENDING bookings in a recurring group ────────────────────────
const approveRecurringGroup = async (req, res) => {
  try {
    const { recurrence_id } = req.params;
    if (!recurrence_id) {
      return res
        .status(400)
        .json({ success: false, message: "recurrence_id is required" });
    }

    // Load all PENDING bookings in the group (with populated fields)
    const pendingBookings = await Booking.find({
      recurrence_id,
      status: "PENDING",
    })
      .populate("user_id", "full_name email")
      .populate("room_id", "name location");

    if (pendingBookings.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No pending bookings found for this recurring group",
        });
    }

    const approved = [];
    const skipped = []; // conflict

    for (const booking of pendingBookings) {
      // Check time-slot conflict for each date individually
      const conflict = await Booking.findOne({
        _id: { $ne: booking._id },
        room_id: booking.room_id._id,
        date: booking.date,
        status: "APPROVED",
        $or: [
          {
            start_time: { $lt: booking.end_time },
            end_time: { $gt: booking.start_time },
          },
        ],
      });

      if (conflict) {
        skipped.push({
          booking_id: booking._id,
          date: booking.date.toISOString().split("T")[0],
          reason: "Time slot conflict",
        });
        continue;
      }

      booking.status = "APPROVED";
      booking.approved_at = new Date();
      booking.approved_by = req.user._id;
      await booking.save();
      approved.push(booking);
    }

    if (approved.length === 0) {
      return res.status(409).json({
        success: false,
        message:
          "All bookings in this group have time slot conflicts — none were approved.",
        data: { approved_count: 0, skipped_count: skipped.length, skipped },
      });
    }

    // One notification + one email summarising the group (use first booking's user)
    const sample = approved[0];
    const user = sample.user_id;
    const room = sample.room_id;
    const dateList = approved
      .map((b) => b.date.toISOString().split("T")[0])
      .join(", ");

    await Notification.create({
      user_id: user._id,
      title: "Recurring Bookings Approved",
      message: `${approved.length} recurring booking(s) for ${room.name} (${sample.start_time}–${sample.end_time}) have been approved. Dates: ${dateList}.`,
      type: "BOOKING",
      target_type: "Booking",
      target_id: sample._id,
      is_read: false,
    });

    // Send one summary email to the user
    await sendApprovalEmail(user, sample, room, "APPROVED", null);

    // Audit log per approved booking
    for (const booking of approved) {
      await logBookingAction(
        req.user,
        "APPROVE",
        booking,
        `[Group approve] Approved recurring booking for ${room.name} on ${booking.date.toISOString().split("T")[0]}`,
        req,
      );
    }

    return res.status(200).json({
      success: true,
      message: `Approved ${approved.length} booking(s)${skipped.length ? `, skipped ${skipped.length} due to conflicts` : ""}.`,
      data: {
        approved_count: approved.length,
        skipped_count: skipped.length,
        skipped,
      },
    });
  } catch (error) {
    console.error("approveRecurringGroup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Reject all PENDING bookings in a recurring group ─────────────────────────
const rejectRecurringGroup = async (req, res) => {
  try {
    const { recurrence_id } = req.params;
    const { reject_reason } = req.body;

    if (!recurrence_id) {
      return res
        .status(400)
        .json({ success: false, message: "recurrence_id is required" });
    }
    if (!reject_reason || reject_reason.trim().length < 10) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Rejection reason required (min 10 characters)",
        });
    }

    const pendingBookings = await Booking.find({
      recurrence_id,
      status: "PENDING",
    })
      .populate("user_id", "full_name email")
      .populate("room_id", "name location");

    if (pendingBookings.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No pending bookings found for this recurring group",
        });
    }

    const now = new Date();
    await Booking.updateMany(
      { recurrence_id, status: "PENDING" },
      {
        $set: {
          status: "REJECTED",
          reject_reason: reject_reason.trim(),
          approved_at: now,
          approved_by: req.user._id,
        },
      },
    );

    // One notification summarising the rejection
    const sample = pendingBookings[0];
    const user = sample.user_id;
    const room = sample.room_id;

    await Notification.create({
      user_id: user._id,
      title: "Recurring Bookings Rejected",
      message: `${pendingBookings.length} recurring booking(s) for ${room.name} (${sample.start_time}–${sample.end_time}) have been rejected. Reason: ${reject_reason.trim()}.`,
      type: "BOOKING",
      target_type: "Booking",
      target_id: sample._id,
      is_read: false,
    });

    // Send one summary email to the user
    await sendApprovalEmail(
      user,
      sample,
      room,
      "REJECTED",
      reject_reason.trim(),
    );

    // Audit log (one entry for the group)
    await logBookingAction(
      req.user,
      "REJECT",
      sample,
      `[Group reject] Rejected ${pendingBookings.length} recurring bookings for ${room.name}. Reason: ${reject_reason.trim()}`,
      req,
    );

    return res.status(200).json({
      success: true,
      message: `Rejected ${pendingBookings.length} booking(s) in the recurring group.`,
      data: { rejected_count: pendingBookings.length },
    });
  } catch (error) {
    console.error("rejectRecurringGroup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Booking QR Data for check-in
const getBookingQRData = async (req, res) => {
  try {
    const bookingId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("room_id", "room_name room_code location")
      .populate("user_id", "full_name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if user is the owner of the booking
    if (booking.user_id._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking's QR code"
      });
    }

    // Only APPROVED bookings can have QR codes
    if (booking.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Only approved bookings have QR codes"
      });
    }

    if (!booking.qr_code_token) {
      return res.status(400).json({
        success: false,
        message: "QR code not generated for this booking"
      });
    }

    // Return simplified QR data (b,t,type) + booking info for display
    // Frontend will only stringify {b,t,type} for QR code generation
    const qrData = {
      b: booking._id.toString(),
      t: booking.qr_code_token,
      type: "BOOKING_CHECK_IN",
      room_name: booking.room_id.room_name,
      date: booking.date,
      start_time: booking.start_time,
      end_time: booking.end_time
    };

    res.status(200).json({
      success: true,
      data: qrData
    });
  } catch (error) {
    console.error("getBookingQRData error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Check-in Booking via QR Code
const checkInBooking = async (req, res) => {
  try {
    const { booking_id, qr_token } = req.body;

    if (!booking_id || !qr_token) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and QR token are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(booking_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }

    // Find booking
    const booking = await Booking.findById(booking_id)
      .populate("room_id", "room_name room_code location")
      .populate("user_id", "full_name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Validate QR token
    if (booking.qr_code_token !== qr_token) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR code"
      });
    }

    // Check status = APPROVED
    if (booking.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message: `Cannot check-in. Booking status is ${booking.status}`
      });
    }

    // Check if already checked-in
    if (booking.checked_in_at) {
      return res.status(400).json({
        success: false,
        message: "Booking already checked-in",
        checked_in_at: booking.checked_in_at
      });
    }

    // Validate date = today
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate.getTime() !== today.getTime()) {
      return res.status(400).json({
        success: false,
        message: "Can only check-in on booking date",
        booking_date: booking.date
      });
    }

    // Validate time window
    const now = new Date();
    const [startHour, startMin] = booking.start_time.split(":").map(Number);
    const [endHour, endMin] = booking.end_time.split(":").map(Number);

    const bookingStartTime = new Date();
    bookingStartTime.setHours(startHour, startMin, 0, 0);

    const bookingEndTime = new Date();
    bookingEndTime.setHours(endHour, endMin, 0, 0);

    // Check if too early
    if (now < bookingStartTime) {
      const minutesUntilStart = Math.floor((bookingStartTime - now) / (1000 * 60));
      return res.status(400).json({
        success: false,
        message: `Too early. Check-in opens at start time (in ${minutesUntilStart} minutes)`,
        start_time: booking.start_time,
        available_from: bookingStartTime
      });
    }

    // Check if expired
    if (now > bookingEndTime) {
      return res.status(400).json({
        success: false,
        message: "Booking expired. Check-in must be before end time",
        end_time: booking.end_time,
        expired_at: bookingEndTime
      });
    }

    // Determine check-in type (ON_TIME or LATE)
    const onTimeWindow = new Date(bookingStartTime);
    onTimeWindow.setMinutes(onTimeWindow.getMinutes() + 15);

    const checkInType = now <= onTimeWindow ? "ON_TIME" : "LATE";

    // Calculate late duration
    let lateMinutes = 0;
    if (checkInType === "LATE") {
      lateMinutes = Math.floor((now - bookingStartTime) / (1000 * 60));
    }

    // Update booking
    booking.status = "CHECKED-IN";
    booking.checked_in_at = now;
    booking.check_in_type = checkInType;
    await booking.save();

    // Create notification
    await Notification.create({
      user_id: booking.user_id._id,
      title: "Check-in Successful",
      message: checkInType === "LATE"
        ? `Late check-in for ${booking.room_id.room_name} (${lateMinutes} minutes late)`
        : `On-time check-in for ${booking.room_id.room_name}`,
      type: "BOOKING",
      target_type: "Booking",
      target_id: booking._id,
      is_read: false
    });

    // Log audit
    await logBookingAction(
      req.user,
      "CHECK_IN",
      booking,
      checkInType === "LATE"
        ? `Late check-in (${lateMinutes} minutes late) for ${booking.room_id.room_name} by ${booking.user_id.full_name}`
        : `On-time check-in for ${booking.room_id.room_name} by ${booking.user_id.full_name}`,
      req
    );

    res.status(200).json({
      success: true,
      message: checkInType === "LATE"
        ? `Checked-in successfully (late by ${lateMinutes} minutes)`
        : "Checked-in successfully",
      data: {
        booking,
        check_in_type: checkInType,
        late_minutes: lateMinutes,
        checked_in_at: now
      }
    });
  } catch (error) {
    console.error("checkInBooking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createBooking,
  createRecurringBooking,
  getPendingBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  approveRecurringGroup,
  rejectRecurringGroup,
  getMyBookings,
  cancelBooking,
  updateBooking,
  getBookingStatistics,
  getBookingReport,
  getExtendOptions,
  extendBooking,
  getBookingQRData,
  checkInBooking,
};
