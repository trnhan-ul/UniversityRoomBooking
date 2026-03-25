const FacilityIssue = require('../models/FacilityIssue');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Equipment = require('../models/Equipment');
const { Notification } = require('../models');
const User = require('../models/User');
const { logAuditAction } = require('../utils/auditLogger');

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) {
    return null;
  }

  const [hourStr, minuteStr] = timeStr.split(':');
  const hours = Number(hourStr);
  const minutes = Number(minuteStr);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const isNowWithinBookingWindow = (booking) => {
  if (!booking?.date || !booking?.start_time || !booking?.end_time) {
    return false;
  }

  const now = new Date();
  const bookingDate = new Date(booking.date);

  const nowDayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const bookingDayKey = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}-${bookingDate.getDate()}`;

  if (nowDayKey !== bookingDayKey) {
    return false;
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseTimeToMinutes(booking.start_time);
  const endMinutes = parseTimeToMinutes(booking.end_time);

  if (startMinutes === null || endMinutes === null) {
    return false;
  }

  return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
};

// Create a new facility issue report
const createFacilityIssue = async (req, res) => {
  try {
    const {
      booking_id,
      room_id,
      issue_type,
      equipment_id,
      title,
      description,
      severity,
      images,
      location
    } = req.body;

    // Validate required fields
    if (!booking_id || !room_id || !issue_type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify booking exists and belongs to the user
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only report issues for your own bookings'
      });
    }

    if (!['APPROVED', 'CHECKED-IN'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'You can only report issues for approved or checked-in bookings'
      });
    }

    if (!isNowWithinBookingWindow(booking)) {
      return res.status(400).json({
        success: false,
        message: 'You can only report facility issues during your booking time slot'
      });
    }

    // Verify room exists
    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // If equipment_id is provided, verify it exists and belongs to the room
    if (equipment_id) {
      const equipment = await Equipment.findById(equipment_id);
      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found'
        });
      }
      if (equipment.room_id.toString() !== room_id) {
        return res.status(400).json({
          success: false,
          message: 'Equipment does not belong to the specified room'
        });
      }
    }

    // Create the facility issue
    const facilityIssue = new FacilityIssue({
      booking_id,
      room_id,
      reported_by: req.user._id,
      issue_type,
      equipment_id: equipment_id || null,
      title,
      description,
      severity: severity || 'MEDIUM',
      images: images || [],
      location: location || '',
      status: 'REPORTED'
    });

    await facilityIssue.save();

    // Notify all admins about the new issue
    const admins = await User.find({ role: 'ADMINISTRATOR' });
    const notificationPromises = admins.map(admin => {
      const notification = new Notification({
        user_id: admin._id,
        type: 'FACILITY_ISSUE',
        title: 'New Facility Issue Reported',
        message: `A ${severity || 'MEDIUM'} severity issue has been reported in room ${room.room_code}: ${title}`,
        target_type: 'FacilityIssue',
        target_id: facilityIssue._id,
        is_read: false
      });
      return notification.save();
    });

    await Promise.all(notificationPromises);

    // Log the action
    await logAuditAction(
      req.user._id,
      'CREATE',
      'FacilityIssue',
      facilityIssue._id,
      null,
      facilityIssue,
      req
    );

    // Populate the response
    const populatedIssue = await FacilityIssue.findById(facilityIssue._id)
      .populate('reported_by', 'username email full_name')
      .populate('room_id', 'room_code room_name location capacity')
      .populate('booking_id', 'date start_time end_time')
      .populate('equipment_id', 'name status');

    res.status(201).json({
      success: true,
      message: 'Facility issue reported successfully',
      data: populatedIssue
    });

  } catch (error) {
    console.error('Error creating facility issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report facility issue',
      error: error.message
    });
  }
};

// Get all facility issues (Admin only)
const getAllFacilityIssues = async (req, res) => {
  try {
    const {
      status,
      severity,
      issue_type,
      room_id,
      page = 1,
      limit = 20,
      sort = '-created_at'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (issue_type) filter.issue_type = issue_type;
    if (room_id) filter.room_id = room_id;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const issues = await FacilityIssue.find(filter)
      .populate('reported_by', 'username email full_name')
      .populate('room_id', 'room_code room_name location capacity status')
      .populate('booking_id', 'date start_time end_time')
      .populate('equipment_id', 'name status')
      .populate('resolved_by', 'username email full_name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FacilityIssue.countDocuments(filter);

    res.json({
      success: true,
      data: issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching facility issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch facility issues',
      error: error.message
    });
  }
};

// Get facility issues reported by the current user
const getMyFacilityIssues = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sort = '-created_at' } = req.query;

    // Build filter
    const filter = { reported_by: req.user._id };
    if (status) filter.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const issues = await FacilityIssue.find(filter)
      .populate('room_id', 'room_code room_name location capacity')
      .populate('booking_id', 'date start_time end_time')
      .populate('equipment_id', 'name status')
      .populate('resolved_by', 'username email full_name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FacilityIssue.countDocuments(filter);

    res.json({
      success: true,
      data: issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching my facility issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your facility issues',
      error: error.message
    });
  }
};

// Get a specific facility issue by ID
const getFacilityIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await FacilityIssue.findById(id)
      .populate('reported_by', 'username email full_name')
      .populate('room_id', 'room_code room_name location capacity status')
      .populate('booking_id', 'date start_time end_time purpose')
      .populate('equipment_id', 'name status quantity')
      .populate('resolved_by', 'username email full_name');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Facility issue not found'
      });
    }

    // Permission rules:
    // - FACILITY_MANAGER and ADMINISTRATOR can view all issues
    // - Students/Lecturers can only view issues they reported
    const canViewAll = req.user.role === 'ADMINISTRATOR' || req.user.role === 'FACILITY_MANAGER';
    if (!canViewAll && issue.reported_by._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this issue'
      });
    }

    res.json({
      success: true,
      data: issue
    });

  } catch (error) {
    console.error('Error fetching facility issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch facility issue',
      error: error.message
    });
  }
};

// Update facility issue status (Admin only)
const updateFacilityIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, resolution_notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const issue = await FacilityIssue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Facility issue not found'
      });
    }

    const oldIssue = { ...issue.toObject() };

    issue.status = status;
    if (admin_notes) issue.admin_notes = admin_notes;
    
    if (status === 'RESOLVED') {
      issue.resolved_by = req.user._id;
      issue.resolved_at = new Date();
      if (resolution_notes) issue.resolution_notes = resolution_notes;
    }

    await issue.save();

    // Notify the reporter
    const notification = new Notification({
      user_id: issue.reported_by,
      type: 'FACILITY_ISSUE_UPDATE',
      title: 'Facility Issue Status Updated',
      message: `Your reported issue "${issue.title}" has been updated to ${status}`,
      target_type: 'FacilityIssue',
      target_id: issue._id,
      is_read: false
    });
    await notification.save();

    // Log the action
    await logAuditAction(
      req.user._id,
      'UPDATE',
      'FacilityIssue',
      issue._id,
      oldIssue,
      issue,
      req
    );

    const updatedIssue = await FacilityIssue.findById(id)
      .populate('reported_by', 'username email full_name')
      .populate('room_id', 'room_code room_name location capacity')
      .populate('booking_id', 'date start_time end_time')
      .populate('equipment_id', 'name status')
      .populate('resolved_by', 'username email full_name');

    res.json({
      success: true,
      message: 'Facility issue status updated successfully',
      data: updatedIssue
    });

  } catch (error) {
    console.error('Error updating facility issue status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update facility issue status',
      error: error.message
    });
  }
};

// Delete facility issue (Admin only)
const deleteFacilityIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await FacilityIssue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Facility issue not found'
      });
    }

    await FacilityIssue.findByIdAndDelete(id);

    // Log the action
    await logAuditAction(
      req.user._id,
      'DELETE',
      'FacilityIssue',
      id,
      issue,
      null,
      req
    );

    res.json({
      success: true,
      message: 'Facility issue deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting facility issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete facility issue',
      error: error.message
    });
  }
};

// Get facility issue statistics (Admin only)
const getFacilityIssueStats = async (req, res) => {
  try {
    const stats = await FacilityIssue.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          bySeverity: [
            { $group: { _id: '$severity', count: { $sum: 1 } } }
          ],
          byType: [
            { $group: { _id: '$issue_type', count: { $sum: 1 } } }
          ],
          totalCount: [
            { $count: 'total' }
          ],
          openIssues: [
            { $match: { status: { $in: ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS'] } } },
            { $count: 'count' }
          ],
          resolvedIssues: [
            { $match: { status: 'RESOLVED' } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    const formattedStats = {
      byStatus: stats[0].byStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      bySeverity: stats[0].bySeverity.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byType: stats[0].byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      total: stats[0].totalCount[0]?.total || 0,
      open: stats[0].openIssues[0]?.count || 0,
      resolved: stats[0].resolvedIssues[0]?.count || 0
    };

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Error fetching facility issue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch facility issue statistics',
      error: error.message
    });
  }
};

module.exports = {
  createFacilityIssue,
  getAllFacilityIssues,
  getMyFacilityIssues,
  getFacilityIssueById,
  updateFacilityIssueStatus,
  deleteFacilityIssue,
  getFacilityIssueStats
};
