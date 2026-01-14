import React, { useState, useEffect, useCallback } from "react";
import { getMyBookings, cancelBooking } from "../services/bookingService";
import {
  formatDate,
  getStatusVariant,
  getStatusLabel,
  getRoomIcon,
} from "../utils/helpers";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Header from "../components/layout/Header";
import { useAuthContext } from "../context/AuthContext";

const MyBookings = () => {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

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

      if (response.success) {
        setBookings(response.data.bookings);
        setTotal(response.data.pagination.total);
        const limit = response.data.pagination.limit;
        setTotalPages(Math.ceil(response.data.pagination.total / limit));
      } else {
        setError(response.message || "Failed to load bookings");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white">
              My Bookings History
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
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
          <div className="flex border-b border-gray-200 dark:border-gray-800 gap-8">
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
        <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-8 text-gray-600">Loading...</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Bookings Table */}
        {!loading && !error && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">
                  <th className="px-6 py-4 text-left">Room / Space</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Time Slot</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
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
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-blue-600">
                            <span>{getRoomIcon(booking.room_id?.name)}</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {booking.room_id?.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {booking.room_id?.location || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(booking.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {booking.start_time} - {booking.end_time}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={getStatusBadge(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 text-sm font-bold hover:underline">
                          View Details
                        </button>
                        {["PENDING", "APPROVED"].includes(booking.status) && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="text-red-500 text-sm font-bold hover:underline ml-4"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {bookings.length} of {total} {activeTab} bookings
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 disabled:opacity-50 hover:text-blue-600"
                >
                  ‹
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 disabled:opacity-50 hover:text-blue-600"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
