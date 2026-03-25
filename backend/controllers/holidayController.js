const { Holiday, Notification } = require("../models");

const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeDate = (value) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

const safeDateInYear = (year, month, day) => {
  const maxDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, maxDay));
};

const getStoredRange = (holiday) => {
  const start = normalizeDate(holiday.startDate || holiday.date);
  const end = normalizeDate(
    holiday.endDate || holiday.startDate || holiday.date,
  );
  return { start, end };
};

const getHolidayRangeForYear = (holiday, year) => {
  const { start: storedStart, end: storedEnd } = getStoredRange(holiday);

  if (!holiday.isRecurring) {
    return {
      start: storedStart,
      end: storedEnd,
    };
  }

  if (year < storedStart.getFullYear()) {
    return null;
  }

  const durationDays = Math.round((storedEnd - storedStart) / DAY_MS);
  const start = safeDateInYear(
    year,
    storedStart.getMonth(),
    storedStart.getDate(),
  );
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + durationDays);
  end.setHours(0, 0, 0, 0);

  return { start, end };
};

const isDateInHoliday = (holiday, date) => {
  const checkDate = normalizeDate(date);
  const year = checkDate.getFullYear();
  const range = getHolidayRangeForYear(holiday, year);
  if (!range) return false;
  return checkDate >= range.start && checkDate <= range.end;
};

const rangesOverlap = (aStart, aEnd, bStart, bEnd) => {
  return aStart <= bEnd && bStart <= aEnd;
};

const formatDateRange = (start, end) => {
  const startLabel = new Date(start).toLocaleDateString();
  const endLabel = new Date(end).toLocaleDateString();
  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
};

const serializeHoliday = (holiday, yearOverride) => {
  const source =
    typeof holiday.toObject === "function" ? holiday.toObject() : holiday;
  const range =
    typeof yearOverride === "number"
      ? getHolidayRangeForYear(source, yearOverride)
      : getStoredRange(source);

  return {
    ...source,
    startDate: range?.start || source.startDate || source.date,
    endDate: range?.end || source.endDate || source.startDate || source.date,
    date: source.date || source.startDate || range?.start,
  };
};

// Create a new holiday
exports.createHoliday = async (req, res) => {
  try {
    const { name, startDate, endDate, date, description, isRecurring } =
      req.body;
    const parsedStartDate = startDate || date;
    const parsedEndDate = endDate || startDate || date;

    // Validate required fields
    if (!name || !parsedStartDate || !parsedEndDate) {
      return res.status(400).json({
        message: "Holiday name, startDate and endDate are required",
      });
    }

    const holidayStartDate = normalizeDate(parsedStartDate);
    const holidayEndDate = normalizeDate(parsedEndDate);

    if (holidayEndDate < holidayStartDate) {
      return res.status(400).json({
        message: "endDate must be greater than or equal to startDate",
      });
    }

    // Check overlap with existing holiday ranges.
    const existingHolidays = await Holiday.find({}).lean();
    const overlappingHoliday = existingHolidays.find((item) => {
      const { start, end } = getStoredRange(item);
      return rangesOverlap(holidayStartDate, holidayEndDate, start, end);
    });

    if (overlappingHoliday) {
      return res.status(400).json({
        message: "Holiday date range overlaps with an existing holiday",
      });
    }

    // Create holiday
    const holiday = await Holiday.create({
      name,
      date: holidayStartDate,
      startDate: holidayStartDate,
      endDate: holidayEndDate,
      description,
      isRecurring: isRecurring || false,
      createdBy: req.user._id,
    });

    // Send notification to all users
    await Notification.create({
      recipient_type: "ALL_USERS",
      title: "New Holiday Added",
      message: `${name} has been scheduled for ${formatDateRange(holidayStartDate, holidayEndDate)}. Room bookings will not be available during this period.`,
      type: "SYSTEM",
      target_type: "RoomSchedule",
      read_by: [],
    });

    res.status(201).json({
      message: "Holiday created successfully",
      holiday: serializeHoliday(holiday),
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
    const parsedYear = year ? Number(year) : null;

    const holidays = await Holiday.find({})
      .populate("createdBy", "full_name email")
      .sort({ date: 1 })
      .lean();

    let filtered = holidays;

    if (parsedYear) {
      filtered = filtered.filter((holiday) => {
        const range = getHolidayRangeForYear(holiday, parsedYear);
        return !!range;
      });
    }

    if (upcoming === "true") {
      const today = normalizeDate(new Date());
      filtered = filtered.filter((holiday) => {
        if (holiday.isRecurring) {
          const currentYearRange = getHolidayRangeForYear(
            holiday,
            today.getFullYear(),
          );
          if (currentYearRange && currentYearRange.end >= today) {
            return true;
          }
          const nextYearRange = getHolidayRangeForYear(
            holiday,
            today.getFullYear() + 1,
          );
          return !!nextYearRange;
        }

        const range = getStoredRange(holiday);
        return range.end >= today;
      });
    }

    const normalized = filtered.map((holiday) =>
      serializeHoliday(holiday, parsedYear || undefined),
    );

    res.json({
      message: "Holidays retrieved successfully",
      count: normalized.length,
      holidays: normalized,
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

    const holiday = await Holiday.findById(id).populate(
      "createdBy",
      "full_name email",
    );

    if (!holiday) {
      return res.status(404).json({
        message: "Holiday not found",
      });
    }

    res.json({
      message: "Holiday retrieved successfully",
      holiday: serializeHoliday(holiday),
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
    const { name, startDate, endDate, date, description, isRecurring } =
      req.body;

    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({
        message: "Holiday not found",
      });
    }

    const oldName = holiday.name;
    const oldRange = getStoredRange(holiday);

    const mergedStartDate =
      startDate || date || holiday.startDate || holiday.date;
    const mergedEndDate =
      endDate ||
      startDate ||
      date ||
      holiday.endDate ||
      holiday.startDate ||
      holiday.date;

    const normalizedStartDate = normalizeDate(mergedStartDate);
    const normalizedEndDate = normalizeDate(mergedEndDate);

    if (normalizedEndDate < normalizedStartDate) {
      return res.status(400).json({
        message: "endDate must be greater than or equal to startDate",
      });
    }

    const existingHolidays = await Holiday.find({ _id: { $ne: id } }).lean();
    const overlappingHoliday = existingHolidays.find((item) => {
      const { start, end } = getStoredRange(item);
      return rangesOverlap(normalizedStartDate, normalizedEndDate, start, end);
    });

    if (overlappingHoliday) {
      return res.status(400).json({
        message: "Holiday date range overlaps with an existing holiday",
      });
    }

    // Update holiday
    if (name) holiday.name = name;
    holiday.startDate = normalizedStartDate;
    holiday.endDate = normalizedEndDate;
    holiday.date = normalizedStartDate;
    if (description !== undefined) holiday.description = description;
    if (isRecurring !== undefined) holiday.isRecurring = isRecurring;

    await holiday.save();

    // Send notification to all users about the update
    await Notification.create({
      recipient_type: "ALL_USERS",
      title: "Holiday Updated",
      message: `${oldName} (${formatDateRange(oldRange.start, oldRange.end)}) has been updated. New details: ${holiday.name} (${formatDateRange(holiday.startDate, holiday.endDate)}).`,
      type: "SYSTEM",
      target_type: "RoomSchedule",
      read_by: [],
    });

    res.json({
      message: "Holiday updated successfully",
      holiday: serializeHoliday(holiday),
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
    const holidayRange = getStoredRange(holiday);

    await Holiday.findByIdAndDelete(id);

    // Send notification to all users about the deletion
    await Notification.create({
      recipient_type: "ALL_USERS",
      title: "Holiday Removed",
      message: `${holidayName} (${formatDateRange(holidayRange.start, holidayRange.end)}) has been removed from the holiday calendar. Booking is now available during this period.`,
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
    const allHolidays = await Holiday.find({}).lean();

    const holiday = allHolidays.find((item) =>
      isDateInHoliday(item, startOfDay),
    );
    const responseHoliday = holiday
      ? serializeHoliday(holiday, startOfDay.getFullYear())
      : null;

    res.json({
      isHoliday: !!responseHoliday,
      holiday: responseHoliday,
    });
  } catch (error) {
    console.error("Check holiday error:", error);
    res.status(500).json({
      message: "Error checking holiday",
      error: error.message,
    });
  }
};
