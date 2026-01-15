import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { cancelBooking } from "../services/bookingService";
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
          </div>

          {/* Booking Schedule */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Schedule</h2>
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
          </div>

          {/* Purpose */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Purpose</h2>
            <p className="text-base text-gray-700">{booking.purpose || "N/A"}</p>
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
            <button
              onClick={() => navigate("/my-bookings")}
              className="px-6 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-100"
            >
              Close
            </button>
            {["PENDING", "APPROVED"].includes(booking.status) && (
              <button
                onClick={handleCancelBooking}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
