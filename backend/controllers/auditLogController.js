const AuditLog = require("../models/AuditLog");
const User = require("../models/User");

exports.getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      target_type,
      user_id,
      start_date,
      end_date,
      search,
    } = req.query;

    // Build query filter
    const filter = {};

    if (action) {
      filter.action = action;
    }

    if (target_type) {
      filter.target_type = target_type;
    }

    if (user_id) {
      filter.user_id = user_id;
    }

    // Date range filter
    if (start_date || end_date) {
      filter.created_at = {};
      if (start_date) {
        filter.created_at.$gte = new Date(start_date);
      }
      if (end_date) {
        filter.created_at.$lte = new Date(end_date);
      }
    }

    // Search in description
    if (search) {
      filter.description = { $regex: search, $options: "i" };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await AuditLog.countDocuments(filter);

    // Get audit logs with user info
    const logs = await AuditLog.find(filter)
      .populate("user_id", "full_name email role")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / parseInt(limit)),
          total_items: total,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

/**
 * GET /api/audit-logs/stats
 * Get statistics about audit logs
 * Access: ADMINISTRATOR, FACILITY_MANAGER
 */
exports.getAuditLogStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Build date filter
    const dateFilter = {};
    if (start_date || end_date) {
      dateFilter.created_at = {};
      if (start_date) {
        dateFilter.created_at.$gte = new Date(start_date);
      }
      if (end_date) {
        dateFilter.created_at.$lte = new Date(end_date);
      }
    }

    // Get action counts
    const actionStats = await AuditLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get target type counts
    const targetTypeStats = await AuditLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$target_type",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get most active users
    const userStats = await AuditLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$user_id",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user_id: "$_id",
          full_name: "$user.full_name",
          email: "$user.email",
          role: "$user.role",
          count: 1,
        },
      },
    ]);

    // Get total count
    const totalLogs = await AuditLog.countDocuments(dateFilter);

    res.status(200).json({
      success: true,
      data: {
        total_logs: totalLogs,
        action_stats: actionStats,
        target_type_stats: targetTypeStats,
        most_active_users: userStats,
      },
    });
  } catch (error) {
    console.error("Error fetching audit log stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit log statistics",
      error: error.message,
    });
  }
};

/**
 * GET /api/audit-logs/:id
 * Get single audit log by ID
 * Access: ADMINISTRATOR, FACILITY_MANAGER
 */
exports.getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await AuditLog.findById(id)
      .populate("user_id", "full_name email role avatar_url")
      .lean();

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit log",
      error: error.message,
    });
  }
};

/**
 * Helper function to create audit log entry
 * This can be called from other controllers
 */
exports.createAuditLog = async ({
  user,
  action,
  target_type,
  target_id = null,
  description,
  ip_address = null,
  user_agent = null,
}) => {
  try {
    const auditLog = await AuditLog.create({
      user_id: user._id,
      action,
      target_type,
      target_id,
      description,
      ip_address,
      user_agent,
    });
    return auditLog;
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw error to prevent breaking the main operation
    return null;
  }
};
