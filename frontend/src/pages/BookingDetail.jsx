import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { cancelBooking, updateBooking, getExtendOptions, extendBooking } from "../services/bookingService";
import { getRooms } from "../services/roomService";
import { formatDate, getStatusVariant, getStatusLabel } from "../utils/helpers";
import Badge from "../components/common/Badge";
import Header from "../components/layout/Header";
import { useAuthContext } from "../context/AuthContext";

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  
  // Lấy booking data từ navigation state
  const booking = location.state?.booking;

  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [formData, setFormData] = useState({
    room_id: booking?.room_id?._id || "",
    date: booking?.date ? new Date(booking.date).toISOString().split('T')[0] : "",
    start_time: booking?.start_time || "",
    end_time: booking?.end_time || "",
    purpose: booking?.purpose || "",
  });

  // Extend booking state
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendOptions, setExtendOptions] = useState([]);
  const [extendLoading, setExtendLoading] = useState(false);
  const [extendSubmitting, setExtendSubmitting] = useState(false);
  const [selectedExtendTime, setSelectedExtendTime] = useState('');
  const [extendError, setExtendError] = useState('');

  // Check if booking is currently in progress
  const isOngoing = () => {
    if (!booking || booking.status !== 'APPROVED') return false;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const bookingDateStr = new Date(booking.date).toISOString().split('T')[0];
    if (bookingDateStr !== todayStr) return false;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = booking.start_time.split(':').map(Number);
    const [eh, em] = booking.end_time.split(':').map(Number);
    return nowMins >= sh * 60 + sm && nowMins < eh * 60 + em;
  };

  const handleOpenExtend = async () => {
    setShowExtendModal(true);
    setExtendOptions([]);
    setSelectedExtendTime('');
    setExtendError('');
    setExtendLoading(true);
    try {
      const res = await getExtendOptions(booking._id);
      if (res.success) {
        setExtendOptions(res.data.options || []);
        if (res.data.options?.length > 0) setSelectedExtendTime(res.data.options[0].new_end_time);
      }
    } catch (err) {
      setExtendError(err.message || 'Failed to load options');
    } finally {
      setExtendLoading(false);
    }
  };

  const handleConfirmExtend = async () => {
    if (!selectedExtendTime) return;
    setExtendSubmitting(true);
    setExtendError('');
    try {
      await extendBooking(booking._id, selectedExtendTime);
      setShowExtendModal(false);
      navigate('/my-bookings');
    } catch (err) {
      setExtendError(err.message || 'Failed to extend booking');
    } finally {
      setExtendSubmitting(false);
    }
  };

  // Fetch available rooms when edit mode is enabled
  useEffect(() => {
    if (isEditing) {
      const fetchRooms = async () => {
        try {
          setLoadingRooms(true);
          const response = await getRooms('AVAILABLE');
          if (response.success) {
            setRooms(response.data);
          }
        } catch (err) {
          console.error("Failed to fetch rooms:", err);
        } finally {
          setLoadingRooms(false);
        }
      };
      fetchRooms();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
    // Reset form data to original booking data
    setFormData({
      room_id: booking?.room_id?._id || "",
      date: booking?.date ? new Date(booking.date).toISOString().split('T')[0] : "",
      start_time: booking?.start_time || "",
      end_time: booking?.end_time || "",
      purpose: booking?.purpose || "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setError(null);
      
      // Validate required fields
      if (!formData.room_id || !formData.date || !formData.start_time || !formData.end_time || !formData.purpose) {
        setError("All fields are required");
        return;
      }

      // Validate time
      if (formData.end_time <= formData.start_time) {
        setError("End time must be after start time");
        return;
      }

      const response = await updateBooking(id, formData);
      
      if (response.success) {
        alert("Booking updated successfully");
        navigate("/my-bookings");
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to update booking";
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setError(null);
      const response = await cancelBooking(id);
      alert("Booking cancelled successfully");
      navigate("/my-bookings");
    } catch (err) {
      const errorMsg = err.message || "Failed to cancel booking";
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Booking not found
          </div>
          <button
            onClick={() => navigate("/my-bookings")}
            className="mt-4 text-blue-600 hover:underline"
          >
            ← Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/my-bookings")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <span>←</span>
          <span>Back to My Bookings</span>
        </button>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600 text-sm mt-1">
            View complete information about your reservation
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden">
          {/* Status Banner */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Booking Status</p>
                <Badge variant={getStatusVariant(booking.status)} className="mt-1">
                  {getStatusLabel(booking.status)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="text-sm font-mono text-gray-900 mt-1">{booking._id}</p>
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Room Information</h2>
            {isEditing ? (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Select Room</label>
                  {loadingRooms ? (
                    <p className="text-sm text-gray-500">Loading rooms...</p>
                  ) : (
                    <select
                      name="room_id"
                      value={formData.room_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a room</option>
                      {rooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.room_name} - {room.room_code} ({room.location}) - Capacity: {room.capacity}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Room Name</p>
                  <p className="text-base font-semibold text-gray-900">
                    {booking.room_id?.room_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Room Code</p>
                  <p className="text-base font-semibold text-gray-900">
                    {booking.room_id?.room_code || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="text-base font-semibold text-gray-900">
                    {booking.room_id?.location || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Capacity</p>
                  <p className="text-base font-semibold text-gray-900">
                    {booking.room_id?.capacity || "N/A"} seats
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Booking Schedule */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Schedule</h2>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(booking.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Time</p>
                  <p className="text-base font-semibold text-gray-900">
                    {booking.start_time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Time</p>
                  <p className="text-base font-semibold text-gray-900">
                    {booking.end_time}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Purpose */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Purpose</h2>
            {isEditing ? (
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter the purpose of your booking"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            ) : (
              <p className="text-base text-gray-700">{booking.purpose || "N/A"}</p>
            )}
          </div>

          {/* Requester Information */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Requester Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="text-base font-semibold text-gray-900">
                  {booking.user_id?.full_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-base font-semibold text-gray-900">
                  {booking.user_id?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                <p className="text-base font-semibold text-gray-900">
                  {booking.user_id?.phone_number || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Booking Created</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(booking.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {booking.reject_reason && (
            <div className="px-6 py-6 border-b border-gray-200 bg-red-50">
              <h2 className="text-lg font-bold text-red-900 mb-2">Rejection Reason</h2>
              <p className="text-base text-red-700">{booking.reject_reason}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-4">
            {error && (
              <div className="flex-1 text-sm text-red-600">{error}</div>
            )}
            
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-100"
                >
                  Cancel Edit
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-100"
                >
                  Close
                </button>
                {booking.status === "PENDING" && (
                  <button
                    onClick={handleEditClick}
                    className="px-6 py-2.5 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700"
                  >
                    Edit Booking
                  </button>
                )}
                {isOngoing() && (
                  <button
                    onClick={handleOpenExtend}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
                  >
                    ⏱ Extend Booking
                  </button>
                )}
                {["PENDING", "APPROVED"].includes(booking.status) && (
                  <button
                    onClick={handleCancelBooking}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Extend Booking Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-green-600 rounded-t-2xl px-6 py-4">
              <h2 className="text-white font-bold text-lg">⏱ Extend Booking</h2>
              <p className="text-green-100 text-sm mt-1">
                {booking.room_id?.room_name} · {booking.start_time} – {booking.end_time}
              </p>
            </div>
            <div className="p-6">
              {extendLoading ? (
                <div className="text-center py-8 text-gray-500">Loading available slots...</div>
              ) : extendOptions.length === 0 && !extendError ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No available time slots to extend.</p>
                  <p className="text-xs text-gray-400 mt-1">Another booking may be right after yours, or you've reached the working hours limit.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">Select how long you want to extend:</p>
                  <div className="space-y-2">
                    {extendOptions.map((opt) => (
                      <label
                        key={opt.new_end_time}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                          selectedExtendTime === opt.new_end_time
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="extend_time"
                          value={opt.new_end_time}
                          checked={selectedExtendTime === opt.new_end_time}
                          onChange={() => setSelectedExtendTime(opt.new_end_time)}
                          className="accent-green-600"
                        />
                        <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
              {extendError && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{extendError}</p>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowExtendModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExtend}
                disabled={!selectedExtendTime || extendSubmitting || extendOptions.length === 0}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {extendSubmitting ? 'Extending...' : `Extend to ${selectedExtendTime}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
