import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings } from "../services/bookingService";
import Header from "../components/layout/Header";
import { useAuthContext } from "../context/AuthContext";

// Parse "HH:mm" into total minutes from midnight
const parseTime = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

// Format seconds into HH:MM:SS
const formatCountdown = (totalSeconds) => {
  if (totalSeconds <= 0) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

// Format minutes into human-readable string
const formatDuration = (minutes) => {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// Determine booking status relative to now
const getBookingTimeStatus = (booking) => {
  const now = new Date();
  const bookingDate = new Date(booking.date);

  // Normalize to same calendar date (ignore time part of booking.date)
  const year = bookingDate.getFullYear();
  const month = bookingDate.getMonth();
  const day = bookingDate.getDate();

  const startMinutes = parseTime(booking.start_time);
  const endMinutes = parseTime(booking.end_time);

  const startDt = new Date(year, month, day, Math.floor(startMinutes / 60), startMinutes % 60, 0);
  const endDt = new Date(year, month, day, Math.floor(endMinutes / 60), endMinutes % 60, 0);

  const nowMs = now.getTime();
  const startMs = startDt.getTime();
  const endMs = endDt.getTime();

  if (nowMs >= startMs && nowMs < endMs) {
    return {
      phase: "ongoing",
      remainingSeconds: Math.floor((endMs - nowMs) / 1000),
      startDt,
      endDt,
    };
  } else if (nowMs < startMs) {
    return {
      phase: "upcoming",
      secondsUntilStart: Math.floor((startMs - nowMs) / 1000),
      durationMinutes: endMinutes - startMinutes,
      startDt,
      endDt,
    };
  } else {
    return { phase: "ended", startDt, endDt };
  }
};

const BookingCard = ({ booking, now }) => {
  const timeStatus = getBookingTimeStatus(booking);
  const room = booking.room_id;

  const dateLabel = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  if (timeStatus.phase === "ongoing") {
    const remaining = Math.max(
      0,
      Math.floor((timeStatus.endDt.getTime() - now.getTime()) / 1000)
    );
    const totalSecs =
      (parseTime(booking.end_time) - parseTime(booking.start_time)) * 60;
    const progressPercent = Math.max(
      0,
      Math.min(100, ((totalSecs - remaining) / totalSecs) * 100)
    );

    return (
      <div className="bg-white rounded-xl shadow-md border-l-4 border-green-500 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
              In Use
            </span>
            <h3 className="text-lg font-bold text-gray-900">
              {room?.room_name || room?.room_code || "Phòng không xác định"}
            </h3>
            {room?.location && (
              <p className="text-sm text-gray-500">{room.location}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Time Remaining</p>
            <p className="text-3xl font-mono font-bold text-green-600">
              {formatCountdown(remaining)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{booking.start_time}</span>
            <span>{booking.end_time}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Date</p>
            <p className="font-medium text-gray-800">{dateLabel}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Purpose</p>
            <p className="font-medium text-gray-800 truncate">{booking.purpose}</p>
          </div>
        </div>
      </div>
    );
  }

  if (timeStatus.phase === "upcoming") {
    const secsUntil = Math.max(
      0,
      Math.floor((timeStatus.startDt.getTime() - now.getTime()) / 1000)
    );

    return (
      <div className="bg-white rounded-xl shadow-md border-l-4 border-blue-400 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-2">
              <span className="material-symbols-outlined text-xs" style={{ fontSize: 14 }}>
                schedule
              </span>
              Sắp diễn ra
            </span>
            <h3 className="text-lg font-bold text-gray-900">
              {room?.room_name || room?.room_code || "Phòng không xác định"}
            </h3>
            {room?.location && (
              <p className="text-sm text-gray-500">{room.location}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Starts In</p>
            <p className="text-2xl font-mono font-bold text-blue-600">
              {formatCountdown(secsUntil)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Time Slot</p>
            <p className="font-medium text-gray-800">
              {booking.start_time} – {booking.end_time}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Duration</p>
            <p className="font-medium text-gray-800">
              {formatDuration(timeStatus.durationMinutes)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Date</p>
            <p className="font-medium text-gray-800">{dateLabel}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Purpose</p>
            <p className="font-medium text-gray-800 truncate">{booking.purpose}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const ViewRemainingTime = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());

  // Tick every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchActiveBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch upcoming approved bookings (today + future)
      const response = await getMyBookings(1, 100, "APPROVED", "upcoming");
      if (response.success && response.data) {
        const all = response.data.bookings || [];
        // Keep only today's ongoing + upcoming, and filter out ended ones
        const relevant = all.filter((b) => {
          const status = getBookingTimeStatus(b);
          return status.phase === "ongoing" || status.phase === "upcoming";
        });
        setBookings(relevant);
      } else {
        setError(response.message || "Failed to load bookings");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveBookings();
    // Refresh booking list every 60 seconds
    const refreshInterval = setInterval(fetchActiveBookings, 60000);
    return () => clearInterval(refreshInterval);
  }, [fetchActiveBookings]);

  // Separate ongoing vs upcoming
  const ongoingBookings = bookings.filter(
    (b) => getBookingTimeStatus(b).phase === "ongoing"
  );
  const upcomingBookings = bookings.filter(
    (b) => getBookingTimeStatus(b).phase === "upcoming"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/homepage")}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              View Remaining Time
            </h1>
            <p className="text-sm text-gray-500">
              Track remaining time for your active room bookings
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-400">Current Time</p>
            <p className="text-lg font-mono font-semibold text-gray-700">
              {now.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-red-400 text-4xl mb-2 block">
              error_outline
            </span>
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchActiveBookings}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Ongoing bookings */}
            {ongoingBookings.length > 0 && (
              <section className="mb-8">
                <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  In Use ({ongoingBookings.length})
                </h2>
                <div className="space-y-4">
                  {ongoingBookings.map((b) => (
                    <BookingCard key={b._id} booking={b} now={now} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming bookings */}
            {upcomingBookings.length > 0 && (
              <section className="mb-8">
                <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500" style={{ fontSize: 18 }}>
                    schedule
                  </span>
                  Upcoming ({upcomingBookings.length})
                </h2>
                <div className="space-y-4">
                  {upcomingBookings.map((b) => (
                    <BookingCard key={b._id} booking={b} now={now} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {ongoingBookings.length === 0 && upcomingBookings.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <span className="material-symbols-outlined text-gray-300 text-6xl mb-4 block">
                  timer_off
                </span>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Active Bookings
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  You have no rooms currently in use or upcoming today.
                </p>
                <button
                  onClick={() => navigate("/create-booking")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontSize: 18 }}>
                    add
                  </span>
                  Book a Room
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ViewRemainingTime;
