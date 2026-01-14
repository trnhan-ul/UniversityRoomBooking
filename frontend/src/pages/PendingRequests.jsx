import React, { useState, useEffect } from 'react';
import { getPendingBookings, approveBooking } from '../../services/bookingService';
import { Button, Badge } from '../../components/common';
import { useAuthContext } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const PendingRequests = () => {
  const { user: currentUser } = useAuthContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [filterType, setFilterType] = useState('all'); // all, priority, conflict
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10
  });

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch pending bookings
  const fetchPendingBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPendingBookings(page, 10);
      if (response.success) {
        setBookings(response.data.bookings);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pending bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, [page]);

  // Filter bookings based on type
  const getFilteredBookings = () => {
    if (filterType === 'priority') {
      return bookings.filter(b => b.priority === 'HIGH');
    }
    if (filterType === 'conflict') {
      return bookings.filter(b => b.has_conflict === true);
    }
    return bookings;
  };

  const filteredBookings = getFilteredBookings();
  const conflictCount = bookings.filter(b => b.has_conflict === true).length;

  // Handle approve
  const handleApprove = async (bookingId) => {
    try {
      const response = await approveBooking(bookingId, { action: 'APPROVE' });
      if (response.success) {
        setSuccess('Booking approved successfully');
        setIsApproveModalOpen(false);
        setSelectedBooking(null);
        fetchPendingBookings();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to approve booking');
    }
  };

  // Handle reject
  const handleReject = async (bookingId) => {
    if (!rejectReason.trim() || rejectReason.length < 10) {
      setError('Rejection reason must be at least 10 characters');
      return;
    }
    try {
      const response = await approveBooking(bookingId, {
        action: 'REJECT',
        reject_reason: rejectReason
      });
      if (response.success) {
        setSuccess('Booking rejected successfully');
        setIsApproveModalOpen(false);
        setRejectReason('');
        setSelectedBooking(null);
        fetchPendingBookings();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to reject booking');
    }
  };

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const openApproveModal = (booking) => {
    setSelectedBooking(booking);
    setIsApproveModalOpen(true);
  };

  const getStatusColor = (hasConflict) => {
    return hasConflict ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
  };

  const getPendingCount = () => {
    if (filterType === 'priority') return bookings.filter(b => b.priority === 'HIGH').length;
    if (filterType === 'conflict') return conflictCount;
    return pagination.total;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Pending Requests</h1>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            {getPendingCount()} Total
          </span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
          📥 Export Report
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-slate-200 bg-white p-6 hidden lg:flex flex-col gap-8 overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Request Summary</h3>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex justify-between items-start mb-2">
                <p className="text-2xl font-bold text-blue-600">{pagination.total}</p>
                <span className="text-2xl">⏳</span>
              </div>
              <p className="text-sm font-medium text-slate-600">Pending reviews remaining</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Conflicts Detected</p>
                <p className="text-xl font-bold text-amber-600">{conflictCount}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Approved Today</p>
                <p className="text-xl font-bold text-green-600">8</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-200">
            <button className="w-full h-10 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">
              ✨ Process All
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">✕</button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex bg-slate-200 p-1 rounded-xl w-fit mb-6">
            <button
              onClick={() => { setFilterType('all'); setPage(1); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => { setFilterType('priority'); setPage(1); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                filterType === 'priority'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Priority
            </button>
            <button
              onClick={() => { setFilterType('conflict'); setPage(1); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                filterType === 'conflict'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Conflicts
              {conflictCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {conflictCount}
                </span>
              )}
            </button>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Requester</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Room Information</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Date & Time</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        Loading pending requests...
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No pending requests found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className={`hover:bg-slate-50 transition-colors group ${
                          booking.has_conflict ? 'border-l-4 border-l-amber-400' : ''
                        }`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                              {booking.user?.full_name
                                ?.split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{booking.user?.full_name}</p>
                              <span className="text-xs font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                {booking.user?.role === 'TEACHER' ? 'Lecturer' : booking.user?.role}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold">{booking.room?.name}</p>
                          <p className="text-xs text-slate-500">{booking.room?.location}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-medium">{formatDate(booking.date)}</p>
                          <p className="text-xs text-slate-500">
                            {booking.start_time} - {booking.end_time}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                              booking.has_conflict
                            )}`}
                          >
                            {booking.has_conflict ? (
                              <>
                                <span className="text-lg">⚠️</span> Conflict
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Clear
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openDetails(booking)}
                              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => openApproveModal(booking)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600"
                              title="Approve"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsApproveModalOpen(true);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600"
                              title="Reject"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && filteredBookings.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                <p className="text-xs text-slate-600">
                  Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of{' '}
                  {pagination.total} requests
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs font-bold border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {[...Array(Math.min(3, Math.ceil(pagination.total / 10)))].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1 text-xs font-bold rounded ${
                          page === p
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-300 bg-white hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(pagination.total / 10)}
                    className="px-3 py-1 text-xs font-bold border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold">Booking Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Requester</p>
                <p className="text-sm font-bold">{selectedBooking.user?.full_name}</p>
                <p className="text-xs text-slate-600">{selectedBooking.user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Room</p>
                <p className="text-sm font-bold">{selectedBooking.room?.name}</p>
                <p className="text-xs text-slate-600">
                  {selectedBooking.room?.location} • Capacity: {selectedBooking.room?.capacity}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Date & Time</p>
                <p className="text-sm font-bold">{formatDate(selectedBooking.date)}</p>
                <p className="text-xs text-slate-600">
                  {selectedBooking.start_time} - {selectedBooking.end_time}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Purpose</p>
                <p className="text-sm">{selectedBooking.purpose || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Status</p>
                <Badge variant={selectedBooking.has_conflict ? 'cancelled' : 'confirmed'}>
                  {selectedBooking.has_conflict ? 'Conflict Detected' : 'Clear'}
                </Badge>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    openApproveModal(selectedBooking);
                  }}
                  className="flex-1"
                >
                  Take Action
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {isApproveModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold">
                {rejectReason ? 'Reject Booking' : 'Approve or Reject?'}
              </h2>
            </div>
            {!rejectReason ? (
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600">
                  <strong>{selectedBooking.user?.full_name}</strong> is requesting{' '}
                  <strong>{selectedBooking.room?.name}</strong> on{' '}
                  <strong>{formatDate(selectedBooking.date)}</strong>
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(selectedBooking._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    onClick={() => setRejectReason('')}
                    variant="danger"
                    className="flex-1"
                  >
                    ✕ Reject
                  </Button>
                </div>
                <button
                  onClick={() => {
                    setIsApproveModalOpen(false);
                    setRejectReason('');
                  }}
                  className="w-full px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejection (minimum 10 characters)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={4}
                />
                <div className="text-xs text-slate-500">
                  {rejectReason.length} characters
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleReject(selectedBooking._id)}
                    variant="danger"
                    disabled={rejectReason.length < 10}
                    className="flex-1"
                  >
                    Submit Rejection
                  </Button>
                  <Button
                    onClick={() => setRejectReason('Approve')}
                    variant="secondary"
                    className="flex-1"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
