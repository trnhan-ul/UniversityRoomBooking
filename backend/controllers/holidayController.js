const { Holiday, User, Notification } = require("../models");

// Create a new holiday
exports.createHoliday = async (req, res) => {
  try {
    const { name, date, description, isRecurring } = req.body;

    // Validate required fields
    if (!name || !date) {
      return res.status(400).json({
        message: "Holiday name and date are required",
      });
    }

    // Parse date to ensure consistent format
    const holidayDate = new Date(date);
    holidayDate.setHours(0, 0, 0, 0);

    // Check if holiday already exists on this date
    const startOfDay = new Date(holidayDate);
    const endOfDay = new Date(holidayDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingHoliday = await Holiday.findOne({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    if (existingHoliday) {
      return res.status(400).json({
        message: "A holiday already exists on this date",
      });
    }

    // Create holiday
    const holiday = await Holiday.create({
      name,
      date: holidayDate,
      description,
      isRecurring: isRecurring || false,
      createdBy: req.user._id,
    });

    // Send notification to all users
    await Notification.create({
      recipient_type: "ALL_USERS",
      title: "New Holiday Added",
      message: `${name} has been scheduled on ${new Date(date).toLocaleDateString()}. Room bookings will not be available on this date.`,
      type: "SYSTEM",
      target_type: "RoomSchedule",
      read_by: [],
    });

    res.status(201).json({
      message: "Holiday created successfully",
      holiday,
    });
  } catch (error) {
    console.error("Create holiday error:", error);
    res.status(500).json({
      message: "Error creating holiday",
      error: error.message,
    });
  }
};

// Get all holidays
exports.getAllHolidays = async (req, res) => {
  try {
    const { year, upcoming } = req.query;

    let filter = {};

    // Filter by year if provided
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      endDate.setHours(23, 59, 59, 999);
      filter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Filter upcoming holidays if requested
    if (upcoming === "true") {
      filter.date = {
        $gte: new Date(),
      };
    }

    const holidays = await Holiday.find(filter)
      .populate("createdBy", "full_name email")
      .sort({ date: 1 })
      .lean();

    res.json({
      message: "Holidays retrieved successfully",
      count: holidays.length,
      holidays,
    });
  } catch (error) {
    console.error("Get holidays error:", error);
    res.status(500).json({
      message: "Error retrieving holidays",
      error: error.message,
    });
  }
};

// Get holiday by ID
exports.getHolidayById = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findById(id)
      .populate("createdBy", "full_name email");

    if (!holiday) {
      return res.status(404).json({
        message: "Holiday not found",
      });
    }

    res.json({
      message: "Holiday retrieved successfully",
      holiday,
    });
  } catch (error) {
    console.error("Get holiday error:", error);
    res.status(500).json({
      message: "Error retrieving holiday",
      error: error.message,
    });
  }
};

// Update holiday
exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, description, isRecurring } = req.body;

    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({
        message: "Holiday not found",
      });
    }

    const oldName = holiday.name;
    const oldDate = holiday.date;

    // If date is being changed, check if new date already has a holiday
    if (date && date !== holiday.date.toISOString().split('T')[0]) {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      
      const startOfDay = new Date(newDate);
      const endOfDay = new Date(newDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const existingHoliday = await Holiday.findOne({
        date: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
        _id: { $ne: id },
      });

      if (existingHoliday) {
        return res.status(400).json({
          message: "A holiday already exists on this date",
        });
      }
    }

    // Update holiday
    if (name) holiday.name = name;
    if (date) holiday.date = new Date(date);
    if (description !== undefined) holiday.description = description;
    if (isRecurring !== undefined) holiday.isRecurring = isRecurring;

    await holiday.save();

    // Send notification to all users about the update
    await Notification.create({
      recipient_type: "ALL_USERS",
      title: "Holiday Updated",
      message: `${oldName} has been updated. New details: ${holiday.name} on ${holiday.date.toLocaleDateString()}.`,
      type: "SYSTEM",
      target_type: "RoomSchedule",
      read_by: [],
    });

    res.json({
      message: "Holiday updated successfully",
      holiday,
    });
  } catch (error) {
    console.error("Update holiday error:", error);
    res.status(500).json({
      message: "Error updating holiday",
      error: error.message,
    });
  }
};

// Delete holiday
exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({
        message: "Holiday not found",
      });
    }

    const holidayName = holiday.name;
    const holidayDate = holiday.date;

    await Holiday.findByIdAndDelete(id);

    // Send notification to all users about the deletion
    await Notification.create({
      recipient_type: "ALL_USERS",
      title: "Holiday Removed",
      message: `${holidayName} (${holidayDate.toLocaleDateString()}) has been removed from the holiday calendar. Booking is now available on this date.`,
      type: "SYSTEM",
      target_type: "RoomSchedule",
      read_by: [],
    });

    res.json({
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    console.error("Delete holiday error:", error);
    res.status(500).json({
      message: "Error deleting holiday",
      error: error.message,
    });
  }
};

// Check if a date is a holiday
exports.checkHoliday = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date parameter is required",
      });
    }

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const startOfDay = new Date(checkDate);
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);

    const holiday = await Holiday.findOne({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    res.json({
      isHoliday: !!holiday,
      holiday: holiday || null,
    });
  } catch (error) {
    console.error("Check holiday error:", error);
    res.status(500).json({
      message: "Error checking holiday",
      error: error.message,
    });
  }
};
