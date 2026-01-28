import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { getCalendarData } from '../services/scheduleService';
import { getRooms } from '../services/roomService';

const ScheduleManagement = () => {
  const [events, setEvents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [bookingStatus, setBookingStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Generate time slots (7:00 AM - 9:00 PM)
  const timeSlots = [];
  for (let hour = 7; hour <= 21; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  // Get days of current week
  const weekDays = [];
  const startOfWeek = moment(currentWeek).startOf('week');
  for (let i = 0; i < 7; i++) {
    weekDays.push(moment(startOfWeek).add(i, 'days'));
  }

  // Calculate event position and height
  const getEventStyle = (event, day) => {
    const eventStart = moment(event.start);
    const eventEnd = moment(event.end);
    const dayStart = moment(day).hour(7).minute(0);
    
    const startMinutes = eventStart.diff(dayStart, 'minutes');
    const durationMinutes = eventEnd.diff(eventStart, 'minutes');
    
    const pixelsPerHour = 60; // minHeight of each slot
    const top = (startMinutes / 60) * pixelsPerHour;
    const height = (durationMinutes / 60) * pixelsPerHour;
    
    return { top, height };
  };

  // Get events for specific day
  const getEventsForDay = (day) => {
    const dayStr = day.format('YYYY-MM-DD');
    return events.filter(event => {
      const eventDay = moment(event.start).format('YYYY-MM-DD');
      return eventDay === dayStr;
    });
  };

  // Fetch rooms for filter
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await getRooms('');
        console.log('Rooms response:', response);
        if (response.success) {
          setRooms(response.data);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  // Fetch calendar data
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = moment(currentWeek).startOf('week').format('YYYY-MM-DD');
      const endDate = moment(currentWeek).endOf('week').format('YYYY-MM-DD');

      console.log('Fetching calendar data:', { startDate, endDate, selectedRoom, bookingStatus });
      const response = await getCalendarData(startDate, endDate, selectedRoom || null, bookingStatus);
      console.log('Calendar response:', response);
      console.log('Events count:', response.data?.length || 0);
      if (response.data && response.data.length > 0) {
        console.log('First event:', response.data[0]);
        console.log('All events:', response.data);
      }
      if (response.success) {
        setEvents(response.data);
        console.log('Events set successfully. Current events state:', response.data.length);
      } else {
        setError(response.message || 'Failed to fetch calendar data');
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError(error.message || 'Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  }, [currentWeek, selectedRoom, bookingStatus]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Get color for event
  const getEventColor = (event) => {
    if (event.type === 'booking') {
      switch (event.status) {
        case 'APPROVED': return 'bg-green-500 border-green-600';
        case 'PENDING': return 'bg-yellow-500 border-yellow-600';
        case 'REJECTED': return 'bg-red-500 border-red-600';
        case 'CANCELLED': return 'bg-gray-500 border-gray-600';
        default: return 'bg-blue-500 border-blue-600';
      }
    } else {
      switch (event.status) {
        case 'BLOCKED': return 'bg-red-500 border-red-600';
        case 'MAINTENANCE': return 'bg-orange-500 border-orange-600';
        case 'EVENT': return 'bg-purple-500 border-purple-600';
        default: return 'bg-gray-500 border-gray-600';
      }
    }
  };

  // Navigation handlers
  const goToPreviousWeek = () => {
    setCurrentWeek(moment(currentWeek).subtract(1, 'week'));
  };

  const goToNextWeek = () => {
    setCurrentWeek(moment(currentWeek).add(1, 'week'));
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
    const startOfMonth = moment(selectedDate).startOf('month');
    const endOfMonth = moment(selectedDate).endOf('month');
    const startDate = moment(startOfMonth).startOf('week');
    const endDate = moment(endOfMonth).endOf('week');
    
    const days = [];
    let day = startDate;
    
    while (day.isSameOrBefore(endDate)) {
      days.push(moment(day));
      day = moment(day).add(1, 'day');
    }
    
    return days;
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Unable to Load Schedule</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
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
    <div className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Page Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-6 lg:p-8 border-b border-[#cfdbe7] dark:border-slate-800 bg-white dark:bg-background-dark">
        <div className="flex flex-col gap-1">
          <h2 className="text-[#0d141b] dark:text-white text-3xl font-black leading-tight tracking-tight">
            Schedule Management
          </h2>
          <p className="text-[#4c6c9a] dark:text-slate-400 text-sm">View and manage room bookings and blocked time slots</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-4 py-2 bg-background-light dark:bg-slate-800 border border-[#cfdbe7] dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all dark:text-white"
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
            className="px-4 py-2 bg-background-light dark:bg-slate-800 border border-[#cfdbe7] dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all dark:text-white"
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
        <aside className="w-80 border-r border-[#cfdbe7] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0d141b] dark:text-white">
                {selectedDate.format('MMMM YYYY')}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedDate(moment(selectedDate).subtract(1, 'month'))}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-[#4c6c9a]">chevron_left</span>
                </button>
                <button
                  onClick={() => setSelectedDate(moment(selectedDate).add(1, 'month'))}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-[#4c6c9a]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-[#4c6c9a] mb-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {generateCalendarDays().map((day, index) => {
                const isCurrentMonth = day.month() === selectedDate.month();
                const isToday = day.isSame(moment(), 'day');
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day)}
                    className={`h-8 flex items-center justify-center text-xs rounded-lg transition-all ${
                      !isCurrentMonth
                        ? 'text-slate-300 dark:text-slate-700'
                        : isToday
                        ? 'bg-primary text-white font-bold'
                        : 'text-[#0d141b] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {day.format('D')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="pt-6 border-t border-[#cfdbe7] dark:border-slate-800">
            <h4 className="text-xs font-bold text-[#4c6c9a] mb-3">Booking Status</h4>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-green-500"></span>
                <span className="text-xs text-[#0d141b] dark:text-white">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-yellow-500"></span>
                <span className="text-xs text-[#0d141b] dark:text-white">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-500"></span>
                <span className="text-xs text-[#0d141b] dark:text-white">Rejected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-gray-500"></span>
                <span className="text-xs text-[#0d141b] dark:text-white">Cancelled</span>
              </div>
            </div>
            <h4 className="text-xs font-bold text-[#4c6c9a] mb-3 pt-2 border-t border-[#cfdbe7] dark:border-slate-800">Schedule Types</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-500"></span>
                <span className="text-xs text-[#0d141b] dark:text-white">Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-orange-500"></span>
                <span className="text-xs text-[#0d141b] dark:text-white">Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-purple-500"></span>
                <span className="text-xs text-[#0d141b] dark:text-white">Event</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Calendar Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Week Navigation */}
          <section className="px-6 lg:px-8 py-4 bg-white dark:bg-background-dark border-b border-[#cfdbe7] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={goToToday}
                  className="px-4 py-2 rounded-lg border border-[#cfdbe7] dark:border-slate-700 text-[#0d141b] dark:text-white text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Today
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousWeek}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#4c6c9a]">chevron_left</span>
                  </button>
                  <button
                    onClick={goToNextWeek}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#4c6c9a]">chevron_right</span>
                  </button>
                </div>
                <h3 className="text-xl font-bold text-[#0d141b] dark:text-white">
                  {startOfWeek.format('MMMM YYYY')}
                </h3>
              </div>
            </div>
          </section>

          {/* Calendar Grid */}
          <section className="flex-1 overflow-auto">
            {events.length === 0 && !loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">event_busy</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Events Found</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    There are no bookings or schedules for this week.
                    {bookingStatus !== 'ALL' && ' Try changing the filter.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <div className="inline-block min-w-full h-full">
                  {/* Calendar Header - Days of Week */}
                  <div className="grid grid-cols-8 border-b border-[#cfdbe7] dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div className="w-20 p-4 border-r border-[#cfdbe7] dark:border-slate-800"></div>
                    {weekDays.map((day, index) => (
                      <div
                        key={index}
                        className={`flex-1 p-3 text-center border-r border-[#cfdbe7] dark:border-slate-800 ${
                          day.isSame(moment(), 'day') ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="text-xs font-semibold text-[#4c6c9a] mb-1">
                          {day.format('ddd')}
                        </div>
                        <div className={`text-lg font-bold mx-auto ${
                          day.isSame(moment(), 'day')
                            ? 'bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center'
                            : 'text-[#0d141b] dark:text-white'
                        }`}>
                          {day.format('D')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Body - Time Slots */}
                  <div className="relative">
                  {timeSlots.map((timeSlot, timeIndex) => (
                    <div
                      key={timeSlot}
                      className="grid grid-cols-8 border-b border-[#cfdbe7] dark:border-slate-800"
                      style={{ height: '60px' }}
                    >
                      {/* Time Label */}
                      <div className="w-20 p-2 border-r border-[#cfdbe7] dark:border-slate-800 flex items-start justify-end pr-3">
                        <span className="text-xs font-semibold text-[#4c6c9a]">{timeSlot}</span>
                      </div>

                      {/* Day Cells */}
                      {weekDays.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="flex-1 relative border-r border-[#cfdbe7] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          {timeIndex === 0 && getEventsForDay(day).map((event) => {
                            const { top, height } = getEventStyle(event, day);
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
                                  height: `${Math.max(height - 4, 40)}px`
                                }}
                              >
                                <div className="font-bold truncate">
                                  {event.room?.room_code}
                                </div>
                                <div className="text-[10px] opacity-90 truncate">
                                  {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                                </div>
                                {event.type === 'booking' && event.user && (
                                  <div className="text-[10px] opacity-75 truncate mt-0.5">
                                    {event.user.full_name}
                                  </div>
                                )}
                                {event.type === 'blocked' && event.status && (
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#cfdbe7] dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-[#cfdbe7] dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0d141b] dark:text-white">Event Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-[#4c6c9a] hover:text-[#0d141b] dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className={`${getEventColor(selectedEvent)} p-3 rounded-lg`}>
                  <span className="material-symbols-outlined text-white">
                    {selectedEvent.type === 'booking' ? 'event_available' : 'block'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-[#0d141b] dark:text-white">
                    {selectedEvent.title}
                  </h4>
                  <p className="text-sm text-[#4c6c9a] mt-1">
                    {moment(selectedEvent.start).format('MMMM D, YYYY')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-background-light dark:bg-slate-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                    <span className="text-xs font-semibold text-[#4c6c9a]">Start Time</span>
                  </div>
                  <p className="text-sm font-bold text-[#0d141b] dark:text-white">
                    {moment(selectedEvent.start).format('h:mm A')}
                  </p>
                </div>
                <div className="bg-background-light dark:bg-slate-800 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                    <span className="text-xs font-semibold text-[#4c6c9a]">End Time</span>
                  </div>
                  <p className="text-sm font-bold text-[#0d141b] dark:text-white">
                    {moment(selectedEvent.end).format('h:mm A')}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">Room</label>
                <div className="bg-background-light dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-sm font-bold text-[#0d141b] dark:text-white">
                    {selectedEvent.room?.room_code} - {selectedEvent.room?.room_name}
                  </p>
                  <p className="text-xs text-[#4c6c9a] mt-1">
                    <span className="material-symbols-outlined text-xs align-middle mr-1">location_on</span>
                    {selectedEvent.room?.location}
                  </p>
                </div>
              </div>

              {selectedEvent.type === 'booking' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">Booking Status</label>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                      selectedEvent.status === 'APPROVED'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : selectedEvent.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : selectedEvent.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {selectedEvent.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">Booked By</label>
                    <div className="bg-background-light dark:bg-slate-800 p-4 rounded-lg flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                        {selectedEvent.user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0d141b] dark:text-white">
                          {selectedEvent.user?.full_name}
                        </p>
                        <p className="text-xs text-[#4c6c9a]">{selectedEvent.user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.purpose && (
                    <div>
                      <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">Purpose</label>
                      <div className="bg-background-light dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm text-[#0d141b] dark:text-white">{selectedEvent.purpose}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.attendees && selectedEvent.attendees > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">Expected Attendees</label>
                      <div className="bg-background-light dark:bg-slate-800 p-4 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">group</span>
                        <p className="text-sm font-bold text-[#0d141b] dark:text-white">
                          {selectedEvent.attendees} people
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedEvent.type === 'blocked' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">Status</label>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                      selectedEvent.status === 'BLOCKED'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : selectedEvent.status === 'MAINTENANCE'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {selectedEvent.status}
                    </span>
                  </div>

                  {selectedEvent.reason && (
                    <div>
                      <label className="block text-xs font-semibold text-[#4c6c9a] mb-2">Reason</label>
                      <div className="bg-background-light dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm text-[#0d141b] dark:text-white">{selectedEvent.reason}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#cfdbe7] dark:border-slate-800 px-6 py-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2.5 bg-background-light dark:bg-slate-800 text-[#0d141b] dark:text-white rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
