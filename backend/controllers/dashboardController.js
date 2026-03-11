const User = require("../models/User");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const AuditLog = require("../models/AuditLog");

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    // --- Time ranges ---
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // --- 1. Total Users + trend ---
    const totalUsers = await User.countDocuments({ status: "ACTIVE" });
    const usersLastMonth = await User.countDocuments({
      status: "ACTIVE",
      created_at: { $lt: startOfMonth },
    });
    const newUsersThisMonth = totalUsers - usersLastMonth;
    const usersTrend = usersLastMonth > 0
      ? ((newUsersThisMonth / usersLastMonth) * 100).toFixed(1)
      : newUsersThisMonth > 0 ? "100.0" : "0.0";

    // --- 2. Monthly Bookings + trend ---
    const monthlyBookings = await Booking.countDocuments({
      created_at: { $gte: startOfMonth },
    });
    const prevMonthBookings = await Booking.countDocuments({
      created_at: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
    });
    const bookingsTrend = prevMonthBookings > 0
      ? (((monthlyBookings - prevMonthBookings) / prevMonthBookings) * 100).toFixed(1)
      : monthlyBookings > 0 ? "100.0" : "0.0";

    // --- 3. Resource Utilization ---
    const totalRooms = await Room.countDocuments();
    const bookedRoomsThisMonth = await Booking.distinct("room_id", {
      created_at: { $gte: startOfMonth },
      status: { $in: ["APPROVED", "CHECKED-IN"] },
    });
    const utilization = totalRooms > 0
      ? ((bookedRoomsThisMonth.length / totalRooms) * 100).toFixed(1)
      : "0.0";

    const prevMonthBookedRooms = await Booking.distinct("room_id", {
      created_at: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
      status: { $in: ["APPROVED", "CHECKED-IN"] },
    });
    const prevUtilization = totalRooms > 0
      ? ((prevMonthBookedRooms.length / totalRooms) * 100).toFixed(1)
      : "0.0";
    const utilizationTrend = (parseFloat(utilization) - parseFloat(prevUtilization)).toFixed(1);

    // --- 4. Pending Bookings count ---
    const pendingBookings = await Booking.countDocuments({ status: "PENDING" });

    // --- 5. User Role Distribution ---
    const roleCounts = await User.aggregate([
      { $match: { status: "ACTIVE" } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const roleDistribution = roleCounts.map((r) => ({
      role: r._id,
      count: r.count,
      percentage: totalUsers > 0 ? parseFloat(((r.count / totalUsers) * 100).toFixed(1)) : 0,
    }));

    // --- 6. Monthly booking volume (last 7 months) ---
    const sevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const bookingVolume = await Booking.aggregate([
      { $match: { created_at: { $gte: sevenMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const volumeData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const found = bookingVolume.find(
        (v) => v._id.year === d.getFullYear() && v._id.month === d.getMonth() + 1
      );
      volumeData.push({
        month: monthNames[d.getMonth()],
        count: found ? found.count : 0,
      });
    }

    // --- 7. Top rooms by booking count this month ---
    const topRoomsAgg = await Booking.aggregate([
      {
        $match: {
          created_at: { $gte: startOfMonth },
          status: { $in: ["APPROVED", "CHECKED-IN"] },
        },
      },
      { $group: { _id: "$room_id", bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      {
        $project: {
          _id: 0,
          name: "$room.room_name",
          room_code: "$room.room_code",
          capacity: "$room.capacity",
          bookingCount: 1,
        },
      },
    ]);

    // Calculate utilization percentage for top rooms
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysSoFar = now.getDate();
    const topRooms = topRoomsAgg.map((room) => {
      const maxBookingsEstimate = daysSoFar * 8; // ~8 slots per day
      const utilizationPct = Math.min(
        Math.round((room.bookingCount / maxBookingsEstimate) * 100),
        100
      );
      return {
        ...room,
        utilization: utilizationPct,
        status: utilizationPct >= 80 ? "High" : utilizationPct >= 50 ? "Med" : "Low",
      };
    });

    // --- 8. Recent activity from audit logs ---
    const recentLogs = await AuditLog.find()
      .sort({ created_at: -1 })
      .limit(5)
      .populate("user_id", "full_name email")
      .lean();

    const recentActivity = recentLogs.map((log) => {
      let icon = "info";
      let type = "system";
      if (log.action === "CREATE" && log.target_type === "Booking") {
        icon = "add_circle";
        type = "booking";
      } else if (log.action === "APPROVE") {
        icon = "check_circle";
        type = "booking";
      } else if (log.action === "REJECT") {
        icon = "cancel";
        type = "alert";
      } else if (log.action === "LOGIN") {
        icon = "login";
        type = "user";
      } else if (log.action === "CREATE" && log.target_type === "User") {
        icon = "person_add";
        type = "user";
      } else if (log.action === "DELETE") {
        icon = "delete";
        type = "alert";
      } else if (log.action === "UPDATE") {
        icon = "edit";
        type = "system";
      }

      const timeDiff = Date.now() - new Date(log.created_at).getTime();
      const minutes = Math.floor(timeDiff / 60000);
      let timeAgo;
      if (minutes < 1) timeAgo = "Just now";
      else if (minutes < 60) timeAgo = `${minutes} min ago`;
      else if (minutes < 1440) timeAgo = `${Math.floor(minutes / 60)} hours ago`;
      else timeAgo = `${Math.floor(minutes / 1440)} days ago`;

      return {
        id: log._id,
        type,
        title: `${log.action} ${log.target_type}`,
        description: log.description || `${log.user_id?.full_name || "System"} performed ${log.action.toLowerCase()} on ${log.target_type}`,
        time: timeAgo,
        icon,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        usersTrend: `${parseFloat(usersTrend) >= 0 ? "+" : ""}${usersTrend}%`,
        monthlyBookings,
        bookingsTrend: `${parseFloat(bookingsTrend) >= 0 ? "+" : ""}${bookingsTrend}%`,
        utilization: `${utilization}%`,
        utilizationTrend: `${parseFloat(utilizationTrend) >= 0 ? "+" : ""}${utilizationTrend}%`,
        pendingBookings,
        totalRooms,
        roleDistribution,
        bookingVolume: volumeData,
        topRooms,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard statistics" });
  }
};

module.exports = { getDashboardStats };
