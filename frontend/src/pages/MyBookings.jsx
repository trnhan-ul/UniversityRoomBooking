import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings, cancelBooking, getBookingQRData } from "../services/bookingService";
import {
  formatDate,
  getStatusVariant,
  getStatusLabel,
} from "../utils/helpers";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Header from "../components/layout/Header";
import { useAuthContext } from "../context/AuthContext";
import { QRCodeSVG } from "qrcode.react";

const MyBookings = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQRData] = useState(null);
  const [qrLoading, setQRLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let timeFilter = null;
      let statusFilter = null;

      if (activeTab === "upcoming") {
        timeFilter = "upcoming";
      } else if (activeTab === "past") {
        timeFilter = "past";
      } else if (activeTab === "cancelled") {
        statusFilter = "CANCELLED";
      }

      const response = await getMyBookings(page, 20, statusFilter, timeFilter);

      if (response.success && response.data) {
        setBookings(response.data.bookings || []);
        setTotal(response.data.pagination?.total || 0);
        const limit = response.data.pagination?.limit || 20;
        setTotalPages(Math.ceil((response.data.pagination?.total || 0) / limit));
      } else {
        setError(response.message || "Failed to load bookings");
        setBookings([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      setBookings([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getStatusBadge = getStatusVariant;

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      alert("Booking cancelled successfully");
      fetchBookings();
    } catch (err) {
      alert(err.message || "Failed to cancel booking");
    }
  };

  const handleViewQR = async (bookingId) => {
    try {
      setQRLoading(true);
      const response = await getBookingQRData(bookingId);
      if (response.success) {
        setQRData(response.data);
        setShowQRModal(true);
      }
    } catch (err) {
      alert(err.message || "Failed to load QR code");
    } finally {
      setQRLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900">
              My Bookings History
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage and view your academic space reservations.
            </p>
          </div>
          <Button
            variant="primary"
            icon="+"
            onClick={() => (window.location.href = "/book")}
          >
            Book a Room
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-300 gap-8">
            <button
              onClick={() => {
                setActiveTab("upcoming");
                setPage(1);
              }}
              className={`pb-3 pt-4 font-bold text-sm border-b-2 transition-colors ${
                activeTab === "upcoming"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => {
                setActiveTab("past");
                setPage(1);
              }}
              className={`pb-3 pt-4 font-bold text-sm border-b-2 transition-colors ${
                activeTab === "past"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Past
            </button>
            <button
              onClick={() => {
                setActiveTab("cancelled");
                setPage(1);
              }}
              className={`pb-3 pt-4 font-bold text-sm border-b-2 transition-colors ${
                activeTab === "cancelled"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by room name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm"
              />
            </div>
          </div>
          <button className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
            📅 Filter by Date
          </button>
          <button className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
            ⚡ Status
          </button>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-8 text-gray-700">Loading...</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Bookings Table */}
        {!loading && !error && (
          <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Room / Space</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Time Slot</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-bold text-gray-900">
                              {booking.room_id?.room_name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-600">
                              {booking.room_id?.location || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {formatDate(booking.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                        {booking.start_time} - {booking.end_time}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusBadge(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => navigate(`/booking-detail/${booking._id}`, { state: { booking } })}
                            className="text-blue-600 text-sm font-semibold hover:underline"
                          >
                            View Details
                          </button>
                          {booking.status === "APPROVED" && (
                            <button
                              onClick={() => handleViewQR(booking._id)}
                              className="text-green-600 text-sm font-semibold hover:underline"
                              disabled={qrLoading}
                            >
                              📱 View QR
                            </button>
                          )}
                          {["PENDING", "APPROVED"].includes(booking.status) && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="text-red-600 text-sm font-semibold hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-white">
              <p className="text-sm text-gray-600">
                Showing {bookings.length} of {total} {activeTab} bookings
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ‹
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Check-in QR Code
              </h3>

              {/* QR Code */}
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-4 inline-block">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={JSON.stringify({
                    b: qrData.b,
                    t: qrData.t,
                    type: qrData.type
                  })}
                  size={280}
                  level="M"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>

              {/* Booking Info */}
              <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Room:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {qrData.room_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDate(qrData.date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {qrData.start_time} - {qrData.end_time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const svg = document.querySelector('#qr-code-svg');
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const data = new XMLSerializer().serializeToString(svg);
                    const img = new Image();
                    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(svgBlob);
                    
                    img.onload = () => {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx.fillStyle = '#FFFFFF';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      ctx.drawImage(img, 0, 0);
                      
                      canvas.toBlob((blob) => {
                        const pngUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = pngUrl;
                        link.download = `qr-code-${qrData.room_name || 'booking'}.png`;
                        link.click();
                        URL.revokeObjectURL(pngUrl);
                        URL.revokeObjectURL(url);
                      });
                    };
                    img.src = url;
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                   Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
