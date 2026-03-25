import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { getCalendarData } from '../services/scheduleService';
import { getRooms, blockTimeSlot, unblockTimeSlot } from '../services/roomService';
import { useAuth } from '../hooks/useAuth';
import { generateTimeOptions } from '../utils/timeFormat';
import { runMutationWithRefresh } from "../utils/mutationRefresh";

const ScheduleManagement = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [bookingStatus, setBookingStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Block Time Modal State
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockFormData, setBlockFormData] = useState({
    room_id: "",
    date: "",
    start_time: "",
    end_time: "",
    status: "BLOCKED",
    reason: "",
  });
  const [blockLoading, setBlockLoading] = useState(false);
  const [conflicts, setConflicts] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  // Generate time options for dropdowns
  const timeOptions = generateTimeOptions();

  // Generate time slots (7:00 AM - 9:00 PM)
  const timeSlots = [];
  for (let hour = 7; hour <= 21; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  // Get days of current week
  const weekDays = [];
  const startOfWeek = moment(currentWeek).startOf("week");
  for (let i = 0; i < 7; i++) {
    weekDays.push(moment(startOfWeek).add(i, "days"));
  }

  // Calculate event position and height
  const getEventStyle = (event, day) => {
    const eventStart = moment(event.start);
    const eventEnd = moment(event.end);
    const dayStart = moment(day).hour(7).minute(0);

    const startMinutes = eventStart.diff(dayStart, "minutes");
    const durationMinutes = eventEnd.diff(eventStart, "minutes");

    const pixelsPerHour = 60; // minHeight of each slot
    const top = (startMinutes / 60) * pixelsPerHour;
    const height = (durationMinutes / 60) * pixelsPerHour;

    return { top, height };
  };

  // Get events for specific day
  const getEventsForDay = (day) => {
    const dayStr = day.format("YYYY-MM-DD");
    return events.filter((event) => {
      const eventDay = moment(event.start).format("YYYY-MM-DD");
      return eventDay === dayStr;
    });
  };

  // Fetch rooms for filter
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await getRooms("");
        console.log("Rooms response:", response);
        if (response.success) {
          setRooms(response.data);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRooms();
  }, []);

  // Fetch calendar data
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = moment(currentWeek)
        .startOf("week")
        .format("YYYY-MM-DD");
      const endDate = moment(currentWeek).endOf("week").format("YYYY-MM-DD");

      console.log("Fetching calendar data:", {
        startDate,
        endDate,
        selectedRoom,
        bookingStatus,
      });
      const response = await getCalendarData(
        startDate,
        endDate,
        selectedRoom || null,
        bookingStatus,
      );
      console.log("Calendar response:", response);
      console.log("Events count:", response.data?.length || 0);
      if (response.data && response.data.length > 0) {
        console.log("First event:", response.data[0]);
        console.log("All events:", response.data);
      }
      if (response.success) {
        setEvents(response.data);
        console.log(
          "Events set successfully. Current events state:",
          response.data.length,
        );
      } else {
        setError(response.message || "Failed to fetch calendar data");
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      setError(error.message || "Failed to fetch calendar data");
    } finally {
      setLoading(false);
    }
  }, [currentWeek, selectedRoom, bookingStatus]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Block Time Modal Handlers
  const handleBlockChange = (e) => {
    setBlockFormData({
      ...blockFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBlockSubmit = async (e, force = false) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (
      !blockFormData.room_id ||
      !blockFormData.date ||
      !blockFormData.start_time ||
      !blockFormData.end_time ||
      !blockFormData.reason
    ) {
      alert("Please fill all required fields");
      return;
    }

    setBlockLoading(true);

    // Only clear conflicts/errorCode if this is NOT a force retry
    if (!force) {
      setConflicts(null);
      setErrorCode(null);
    }

    try {
      const payload = { ...blockFormData, force };
      console.log("Submitting block request:", payload);
      const response = await runMutationWithRefresh({
        mutate: () => blockTimeSlot(payload),
        refresh: fetchCalendarData,
      });

      if (response.success) {
        alert(response.message);
        setShowBlockModal(false);
        setBlockFormData({
          room_id: "",
          date: "",
          start_time: "",
          end_time: "",
          status: "BLOCKED",
          reason: "",
        });
        setConflicts(null);
        setErrorCode(null);
      }
    } catch (error) {
      console.log("Block error:", error);
      if (error.error_code === "APPROVED_BOOKINGS_EXIST") {
        // Hard block - show error and stop
        setErrorCode("APPROVED_BOOKINGS_EXIST");
        setConflicts(error.conflicts);
      } else if (error.error_code === "PENDING_BOOKINGS_EXIST") {
        // Soft warning - show conflicts and allow force
        setErrorCode("PENDING_BOOKINGS_EXIST");
        setConflicts(error.conflicts);
      } else {
        // Other errors
        alert(error.message || "Failed to block time slot");
        setConflicts(null);
        setErrorCode(null);
      }
    } finally {
      setBlockLoading(false);
    }
  };

  const handleForceBlock = async (e) => {
    e.preventDefault();
    if (
      !window.confirm(
        "This will automatically reject all pending bookings. Continue?",
      )
    ) {
      return;
    }

    // Call with force=true to reject pending bookings and create block
    await handleBlockSubmit(null, true);
  };

  // Unblock time slot handler
  const handleUnblock = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      alert("Invalid schedule selection");
      return;
    }

    // Check if event has already passed
    const eventEnd = moment(selectedEvent.end);
    if (eventEnd.isBefore(moment())) {
      alert("Cannot unblock a time slot that has already passed");
      return;
    }

    if (!window.confirm("Are you sure you want to unblock this time slot?")) {
      return;
    }

    try {
      const response = await runMutationWithRefresh({
        mutate: () => unblockTimeSlot(selectedEvent.id),
        refresh: fetchCalendarData,
      });
      if (response.success) {
        alert("Time slot unblocked successfully");
        setShowDetailModal(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      alert(error.message || "Failed to unblock time slot");
    }
  };

  // Check if user can unblock (Admin or Facility Manager)
  const canUnblock = () => {
    return (
      user &&
      (user.role === "ADMINISTRATOR" || user.role === "FACILITY_MANAGER")
    );
  };

  // Check if event can be unblocked (not in the past)
  const canUnblockEvent = (event) => {
    if (!event) return false;
    const eventEnd = moment(event.end);
    return eventEnd.isAfter(moment());
  };

  // Get color for event
  const getEventColor = (event) => {
    if (event.type === "booking") {
      switch (event.status) {
        case "APPROVED":
          return "bg-green-500 border-green-600";
        case "PENDING":
          return "bg-yellow-500 border-yellow-600";
        case "REJECTED":
          return "bg-red-500 border-red-600";
        case "CANCELLED":
          return "bg-gray-500 border-gray-600";
        default:
          return "bg-blue-500 border-blue-600";
      }
    } else {
      switch (event.status) {
        case "BLOCKED":
          return "bg-red-500 border-red-600";
        case "MAINTENANCE":
          return "bg-orange-500 border-orange-600";
        case "EVENT":
          return "bg-purple-500 border-purple-600";
        default:
          return "bg-gray-500 border-gray-600";
      }
    }
  };

  // Navigation handlers
  const goToPreviousWeek = () => {
    setCurrentWeek(moment(currentWeek).subtract(1, "week"));
  };

  const goToNextWeek = () => {
    setCurrentWeek(moment(currentWeek).add(1, "week"));
  };

  const goToToday = () => {
    setCurrentWeek(moment());
    setSelectedDate(moment());
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentWeek(date);
  };

  // Generate calendar days for mini calendar
  const generateCalendarDays = () => {
    const startOfMonth = moment(selectedDate).startOf("month");
    const endOfMonth = moment(selectedDate).endOf("month");
    const startDate = moment(startOfMonth).startOf("week");
    const endDate = moment(endOfMonth).endOf("week");

    const days = [];
    let day = startDate;

    while (day.isSameOrBefore(endDate)) {
      days.push(moment(day));
      day = moment(day).add(1, "day");
    }

    return days;
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">
              error
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Unable to Load Schedule
          </h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchCalendarData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background-light">
      {/* Page Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-6 lg:p-8 border-b border-[#cfdbe7] bg-white">
        <div className="flex flex-col gap-1">
          <h2 className="text-[#0d141b] text-3xl font-black leading-tight tracking-tight">
            Schedule Management
          </h2>
          <p className="text-[#4c6c9a] text-sm">
            View and manage room bookings and blocked time slots
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBlockModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">block</span>
            Block Time Slot
          </button>

          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-4 py-2 bg-background-light border border-[#cfdbe7] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
          >
            <option value="">All Rooms</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.room_code} - {room.room_name}
              </option>
            ))}
          </select>

          <select
            value={bookingStatus}
            onChange={(e) => setBookingStatus(e.target.value)}
            className="px-4 py-2 bg-background-light border border-[#cfdbe7] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
          >
            <option value="ALL">All Bookings</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mini Calendar Sidebar */}
        <aside className="w-80 border-r border-[#cfdbe7] bg-white p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0d141b]">
                {selectedDate.format("MMMM YYYY")}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setSelectedDate(moment(selectedDate).subtract(1, "month"))
                  }
                  className="p-1 rounded hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-[#4c6c9a]">
                    chevron_left
                  </span>
                </button>
                <button
                  onClick={() =>
                    setSelectedDate(moment(selectedDate).add(1, "month"))
                  }
                  className="p-1 rounded hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-[#4c6c9a]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-[#4c6c9a] mb-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {generateCalendarDays().map((day, index) => {
                const isCurrentMonth = day.month() === selectedDate.month();
                const isSelected = day.isSame(selectedDate, "day");

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day)}
                    className={`h-8 flex items-center justify-center text-xs rounded-lg transition-all ${
                      !isCurrentMonth
                        ? "text-slate-300"
                        : isSelected
                          ? "bg-primary text-white font-bold"
                          : "text-[#0d141b] hover:bg-slate-100"
                    }`}
                  >
                    {day.format("D")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="pt-6 border-t border-[#cfdbe7]">
            <h4 className="text-xs font-bold text-[#4c6c9a] mb-3">
              Booking Status
            </h4>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-green-500"></span>
                <span className="text-xs text-[#0d141b]">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-yellow-500"></span>
                <span className="text-xs text-[#0d141b]">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-500"></span>
                <span className="text-xs text-[#0d141b]">Rejected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-gray-500"></span>
                <span className="text-xs text-[#0d141b]">Cancelled</span>
              </div>
            </div>
            <h4 className="text-xs font-bold text-[#4c6c9a] mb-3 pt-2 border-t border-[#cfdbe7]">
              Schedule Types
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-500"></span>
                <span className="text-xs text-[#0d141b]">Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-orange-500"></span>
                <span className="text-xs text-[#0d141b]">Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-purple-500"></span>
                <span className="text-xs text-[#0d141b]">Event</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Calendar Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Week Navigation */}
          <section className="px-6 lg:px-8 py-4 bg-white border-b border-[#cfdbe7]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={goToToday}
                  className="px-4 py-2 rounded-lg border border-[#cfdbe7] text-[#0d141b] text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Today
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousWeek}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#4c6c9a]">
                      chevron_left
                    </span>
                  </button>
                  <button
                    onClick={goToNextWeek}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#4c6c9a]">
                      chevron_right
                    </span>
                  </button>
                </div>
                <h3 className="text-xl font-bold text-[#0d141b]">
                  {startOfWeek.format("MMMM YYYY")}
                </h3>
              </div>
            </div>
          </section>

          {/* Calendar Grid */}
          <section className="flex-1 overflow-auto">
            {events.length === 0 && !loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">
                      event_busy
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    No Events Found
                  </h3>
                  <p className="text-slate-600 text-sm">
                    There are no bookings or schedules for this week.
                    {bookingStatus !== "ALL" && " Try changing the filter."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <div className="inline-block min-w-full h-full">
                  {/* Calendar Header - Days of Week */}
                  <div className="grid grid-cols-8 border-b border-[#cfdbe7] sticky top-0 bg-white z-10">
                    <div className="w-20 p-4 border-r border-[#cfdbe7]"></div>
                    {weekDays.map((day, index) => (
                      <div
                        key={index}
                        className={`flex-1 p-3 text-center border-r border-[#cfdbe7] ${
                          day.isSame(selectedDate, "day") ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="text-xs font-semibold text-[#4c6c9a] mb-1">
                          {day.format("ddd")}
                        </div>
                        <div
                          className={`text-lg font-bold mx-auto ${
                            day.isSame(selectedDate, "day")
                              ? "bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center"
                              : "text-[#0d141b]"
                          }`}
                        >
                          {day.format("D")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Body - Time Slots */}
                  <div className="relative">
                    {timeSlots.map((timeSlot, timeIndex) => (
                      <div
                        key={timeSlot}
                        className="grid grid-cols-8 border-b border-[#cfdbe7]"
                        style={{ height: "60px" }}
                      >
                        {/* Time Label */}
                        <div className="w-20 p-2 border-r border-[#cfdbe7] flex items-start justify-end pr-3">
                          <span className="text-xs font-semibold text-[#4c6c9a]">
                            {timeSlot}
                          </span>
                        </div>

                        {/* Day Cells */}
                        {weekDays.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className={`flex-1 relative border-r border-[#cfdbe7] transition-colors ${
                              day.isSame(selectedDate, "day")
                                ? "bg-primary/5"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            {timeIndex === 0 &&
                              getEventsForDay(day).map((event) => {
                                const { top, height } = getEventStyle(
                                  event,
                                  day,
                                );
                                return (
                                  <div
                                    key={event.id}
                                    onClick={() => {
                                      setSelectedEvent(event);
                                      setShowDetailModal(true);
                                    }}
                                    className={`absolute left-1 right-1 ${getEventColor(event)} text-white text-xs p-2 rounded-lg cursor-pointer hover:opacity-90 transition-all border-l-4 overflow-hidden shadow-sm z-20`}
                                    style={{
                                      top: `${top}px`,
                                      height: `${Math.max(height - 4, 40)}px`,
                                    }}
                                  >
                                    <div className="font-bold truncate">
                                      {event.room?.room_code}
                                    </div>
                                    <div className="text-[10px] opacity-90 truncate">
                                      {moment(event.start).format("h:mm A")} -{" "}
                                      {moment(event.end).format("h:mm A")}
                                    </div>
                                    {event.type === "booking" && event.user && (
                                      <div className="text-[10px] opacity-75 truncate mt-0.5">
                                        {event.user.full_name}
                                      </div>
                                    )}
                                    {event.type === "blocked" &&
                                      event.status && (
                                        <div className="text-[10px] opacity-75 truncate mt-0.5">
                                          {event.status}
                                        </div>
                                      )}
                                  </div>
                                );
                              })}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Event Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#cfdbe7]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-[#cfdbe7] px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0d141b]">
                Event Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-[#4c6c9a] hover:text-[#0d141b] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className={`${getEventColor(selectedEvent)} p-3 rounded-lg`}
                >
                  <span className="material-symbols-outlined text-white">
                    {selectedEvent.type === "booking"
                      ? "event_available"
                      : "block"}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-[#0d141b]">
                    {selectedEvent.title}
                  </h4>
                  <p className="text-sm text-[#4c6c9a] mt-1">
                    {moment(selectedEvent.start).format("MMMM D, YYYY")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-background-light p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-sm text-primary">
                      schedule
                    </span>
                    <span className="text-xs font-semibold text-[#4c6c9a]">
                      Start Time
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#0d141b]">
                    {moment(selectedEvent.start).format("h:mm A")}
                  </p>
                </div>
                <div className="bg-background-light p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-sm text-primary">
                      schedule
                    </span>
                    <span className="text-xs font-semibold text-[#4c6c9a]">
                      End Time
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#0d141b]">
                    {moment(selectedEvent.end).format("h:mm A")}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">
                  Room
                </label>
                <div className="bg-background-light p-4 rounded-lg">
                  <p className="text-sm font-bold text-[#0d141b]">
                    {selectedEvent.room?.room_code} -{" "}
                    {selectedEvent.room?.room_name}
                  </p>
                  <p className="text-xs text-[#4c6c9a] mt-1">
                    <span className="material-symbols-outlined text-xs align-middle mr-1">
                      location_on
                    </span>
                    {selectedEvent.room?.location}
                  </p>
                </div>
              </div>

              {selectedEvent.type === "booking" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">
                      Booking Status
                    </label>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                        selectedEvent.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : selectedEvent.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : selectedEvent.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedEvent.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">
                      Booked By
                    </label>
                    <div className="bg-background-light p-4 rounded-lg flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                        {selectedEvent.user?.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0d141b]">
                          {selectedEvent.user?.full_name}
                        </p>
                        <p className="text-xs text-[#4c6c9a]">
                          {selectedEvent.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.purpose && (
                    <div>
                      <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">
                        Purpose
                      </label>
                      <div className="bg-background-light p-4 rounded-lg">
                        <p className="text-sm text-[#0d141b]">
                          {selectedEvent.purpose}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.attendees && selectedEvent.attendees > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">
                        Expected Attendees
                      </label>
                      <div className="bg-background-light p-4 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">
                          group
                        </span>
                        <p className="text-sm font-bold text-[#0d141b]">
                          {selectedEvent.attendees} people
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedEvent.type === "blocked" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                        selectedEvent.status === "BLOCKED"
                          ? "bg-red-100 text-red-700"
                          : selectedEvent.status === "MAINTENANCE"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {selectedEvent.status}
                    </span>
                  </div>

                  {selectedEvent.reason && (
                    <div>
                      <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">
                        Reason
                      </label>
                      <div className="bg-background-light p-4 rounded-lg">
                        <p className="text-sm text-[#0d141b]">
                          {selectedEvent.reason}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#cfdbe7] px-6 py-4">
              {selectedEvent?.type === "blocked" && canUnblock() ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleUnblock}
                    disabled={!canUnblockEvent(selectedEvent)}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
                      canUnblockEvent(selectedEvent)
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    title={
                      !canUnblockEvent(selectedEvent)
                        ? "Cannot unblock time slots in the past"
                        : "Unblock this time slot"
                    }
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        lock_open
                      </span>
                      {canUnblockEvent(selectedEvent)
                        ? "Unblock Time Slot"
                        : "Cannot Unblock (Past)"}
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-4 py-2.5 bg-background-light text-[#0d141b] rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Block Time Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Block Time Slot
              </h2>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockFormData({
                    room_id: "",
                    date: "",
                    start_time: "",
                    end_time: "",
                    status: "BLOCKED",
                    reason: "",
                  });
                  setConflicts(null);
                  setErrorCode(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Conflict Alerts */}
            {errorCode === "APPROVED_BOOKINGS_EXIST" && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-600 mt-0.5">
                    error
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">
                      Cannot Block Time Slot
                    </h3>
                    <p className="text-sm text-red-700 mb-3">
                      The following approved bookings exist. You must contact
                      users to reschedule before blocking this time.
                    </p>
                    <div className="space-y-2">
                      {conflicts?.approved?.map((booking, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded border border-red-200"
                        >
                          <div className="text-sm text-gray-900">
                            <span className="font-semibold">
                              {booking.user}
                            </span>{" "}
                            ({booking.email})
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {booking.time} â€¢ {booking.purpose}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errorCode === "PENDING_BOOKINGS_EXIST" && (
              <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-yellow-600 mt-0.5">
                    warning
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      Pending Bookings Found
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      The following pending bookings will be automatically
                      rejected if you proceed:
                    </p>
                    <div className="space-y-2">
                      {conflicts?.pending?.map((booking, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded border border-yellow-200"
                        >
                          <div className="text-sm text-gray-900">
                            <span className="font-semibold">
                              {booking.user}
                            </span>{" "}
                            ({booking.email})
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {booking.time} â€¢ {booking.purpose}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleForceBlock}
                      disabled={blockLoading}
                      className="mt-4 w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {blockLoading
                        ? "Processing..."
                        : "Proceed and Reject Pending Bookings"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleBlockSubmit} className="p-6 space-y-4">
              {/* Room Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room <span className="text-red-500">*</span>
                </label>
                <select
                  name="room_id"
                  value={blockFormData.room_id}
                  onChange={handleBlockChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select a room</option>
                  {rooms?.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.room_code} - {room.room_name} ({room.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={blockFormData.date}
                  onChange={handleBlockChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={blockFormData.start_time}
                    onChange={handleBlockChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={blockFormData.end_time}
                    onChange={handleBlockChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              {/* Block Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Block Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={blockFormData.status}
                  onChange={handleBlockChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="BLOCKED">Blocked</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="EVENT">Special Event</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={blockFormData.reason}
                  onChange={handleBlockChange}
                  rows="3"
                  placeholder="Explain why this time slot needs to be blocked..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  required
                />
              </div>

              {/* Action Buttons */}
              {errorCode !== "APPROVED_BOOKINGS_EXIST" && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBlockModal(false);
                      setBlockFormData({
                        room_id: "",
                        date: "",
                        start_time: "",
                        end_time: "",
                        status: "BLOCKED",
                        reason: "",
                      });
                      setConflicts(null);
                      setErrorCode(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  {errorCode !== "PENDING_BOOKINGS_EXIST" && (
                    <button
                      type="submit"
                      disabled={blockLoading}
                      className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {blockLoading ? "Checking..." : "Block Time Slot"}
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;

