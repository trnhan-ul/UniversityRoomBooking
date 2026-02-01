const Booking = require("../models/Booking");
const RoomSchedule = require("../models/RoomSchedule");

// Get calendar data (all bookings + blocked schedules)
const getCalendarData = async (req, res) => {
    try {
        const { start_date, end_date, room_id, booking_status } = req.query;

        // Build query filters
        const dateFilter = {};
        if (start_date && end_date) {
            // Use start of day and end of day to ensure we capture all bookings
            const startDate = new Date(start_date);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(end_date);
            endDate.setHours(23, 59, 59, 999);
            
            dateFilter.date = {
                $gte: startDate,
                $lte: endDate,
            };
            
            console.log('Date filter:', {
                start: startDate.toISOString(),
                end: endDate.toISOString()
            });
        }

        const roomFilter = room_id ? { room_id } : {};
        
        // Build booking status filter
        const statusFilter = {};
        if (booking_status && booking_status !== 'ALL') {
            statusFilter.status = booking_status;
        }

        // Fetch bookings (all statuses or filtered)
        const bookingQuery = {
            ...dateFilter,
            ...roomFilter,
            ...statusFilter,
        };
        console.log('Booking query:', JSON.stringify(bookingQuery, null, 2));
        
        const bookings = await Booking.find(bookingQuery)
            .populate("room_id", "room_code room_name location")
            .populate("user_id", "full_name email")
            .lean();
            
        console.log(`Found ${bookings.length} bookings`);
        if (bookings.length > 0) {
            console.log('Sample booking:', JSON.stringify(bookings[0], null, 2));
        }

        // Fetch blocked schedules
        const blockedSchedules = await RoomSchedule.find({
            ...dateFilter,
            ...roomFilter,
        })
            .populate("room_id", "room_code room_name location")
            .populate("created_by", "full_name")
            .lean();

        // Transform bookings to calendar events
        const bookingEvents = bookings.map((booking) => ({
            id: booking._id,
            title: `${booking.room_id?.room_code || "N/A"} - ${booking.user_id?.full_name || "Unknown"}`,
            start: new Date(`${booking.date.toISOString().split("T")[0]}T${booking.start_time}`),
            end: new Date(`${booking.date.toISOString().split("T")[0]}T${booking.end_time}`),
            type: "booking",
            status: booking.status,
            room: booking.room_id,
            user: booking.user_id,
            purpose: booking.purpose,
            attendees: booking.attendees,
            equipment: booking.equipment,
        }));

        // Transform blocked schedules to calendar events
        const blockedEvents = blockedSchedules.map((schedule) => ({
            id: schedule._id,
            title: `${schedule.room_id?.room_code || "N/A"} - ${schedule.status}`,
            start: new Date(`${schedule.date.toISOString().split("T")[0]}T${schedule.start_time}`),
            end: new Date(`${schedule.date.toISOString().split("T")[0]}T${schedule.end_time}`),
            type: "blocked",
            status: schedule.status,
            room: schedule.room_id,
            reason: schedule.reason,
            created_by: schedule.created_by,
        }));

        // Combine and sort events
        const allEvents = [...bookingEvents, ...blockedEvents].sort(
            (a, b) => a.start - b.start
        );
        
        console.log(`Returning ${bookingEvents.length} bookings + ${blockedEvents.length} blocked = ${allEvents.length} total events`);

        res.status(200).json({
            success: true,
            data: allEvents,
            count: {
                bookings: bookingEvents.length,
                blocked: blockedEvents.length,
                total: allEvents.length,
            },
        });
    } catch (error) {
        console.error("Get calendar data error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch calendar data",
            error: error.message,
        });
    }
};

module.exports = {
    getCalendarData,
};
