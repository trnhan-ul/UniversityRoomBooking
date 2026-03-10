import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyFacilityIssues, getFacilityIssueById } from '../services/facilityIssueService';
import { formatTime12Hour } from '../utils/timeFormat';

const MyReportedIssues = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMyFacilityIssues(statusFilter || null, currentPage, 10);
      
      if (response.success) {
        setIssues(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, currentPage]);

  const viewIssueDetails = async (issueId) => {
    try {
      const response = await getFacilityIssueById(issueId);
      if (response.success) {
        setSelectedIssue(response.data);
        setShowModal(true);
      }
    } catch (err) {
      setError('Failed to load issue details');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedIssue(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      REPORTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ACKNOWLEDGED: 'bg-blue-100 text-blue-800 border-blue-200',
      IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
      RESOLVED: 'bg-green-100 text-green-800 border-green-200',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      LOW: 'text-green-600',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      CRITICAL: 'text-red-600'
    };
    return colors[severity] || 'text-gray-600';
  };

  const statuses = ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Reported Issues</h1>
            <p className="mt-2 text-gray-600">View and track your facility issue reports</p>
          </div>
          <button
            onClick={() => navigate('/report-issue')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Report New Issue
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Issues List */}
        {loading ? (
          <div className="bg-white shadow-md rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your reported issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-lg">No issues reported yet</p>
            <button
              onClick={() => navigate('/report-issue')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Report Your First Issue
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {issues.map((issue) => (
                <div
                  key={issue._id}
                  className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => viewIssueDetails(issue._id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{issue.title}</h3>
                      <p className="text-sm text-gray-600">
                        {issue.room_id?.room_code} - {issue.room_id?.room_name}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs font-semibold ${getSeverityColor(issue.severity)}`}>
                        {issue.severity} Priority
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3 line-clamp-2">{issue.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {issue.issue_type.replace('_', ' ')}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(issue.created_at).toLocaleDateString()}
                    </div>
                    {issue.equipment_id && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        {issue.equipment_id.name}
                      </div>
                    )}
                  </div>

                  {issue.location && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Location:</strong> {issue.location}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {pagination.pages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={currentPage === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Issue Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status and Severity */}
              <div className="flex gap-3 mb-4">
                <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedIssue.status)}`}>
                  {selectedIssue.status.replace('_', ' ')}
                </span>
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getSeverityColor(selectedIssue.severity)} bg-gray-100`}>
                  {selectedIssue.severity} Priority
                </span>
              </div>

              {/* Issue Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedIssue.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Type: {selectedIssue.issue_type.replace('_', ' ')}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-gray-700">{selectedIssue.description}</p>
                </div>

                {/* Booking Info */}
                {selectedIssue.booking_id && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Booking Information</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Date:</strong> {new Date(selectedIssue.booking_id.date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {formatTime12Hour(selectedIssue.booking_id.start_time)} - {formatTime12Hour(selectedIssue.booking_id.end_time)}</p>
                      <p><strong>Purpose:</strong> {selectedIssue.booking_id.purpose}</p>
                    </div>
                  </div>
                )}

                {/* Room Info */}
                {selectedIssue.room_id && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Room</h4>
                    <p className="text-gray-700">
                      {selectedIssue.room_id.room_code} - {selectedIssue.room_id.room_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Location: {selectedIssue.room_id.location}
                    </p>
                  </div>
                )}

                {/* Equipment */}
                {selectedIssue.equipment_id && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Equipment</h4>
                    <p className="text-gray-700">
                      {selectedIssue.equipment_id.name} (Status: {selectedIssue.equipment_id.status})
                    </p>
                  </div>
                )}

                {/* Location */}
                {selectedIssue.location && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Specific Location</h4>
                    <p className="text-gray-700">{selectedIssue.location}</p>
                  </div>
                )}

                {/* Images */}
                {selectedIssue.images && selectedIssue.images.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Images</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedIssue.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Issue ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedIssue.admin_notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-1">Admin Notes</h4>
                    <p className="text-yellow-800 text-sm">{selectedIssue.admin_notes}</p>
                  </div>
                )}

                {/* Resolution Info */}
                {selectedIssue.status === 'RESOLVED' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Resolution</h4>
                    <div className="text-sm text-green-800 space-y-1">
                      <p><strong>Resolved by:</strong> {selectedIssue.resolved_by?.full_name || selectedIssue.resolved_by?.username}</p>
                      <p><strong>Resolved at:</strong> {new Date(selectedIssue.resolved_at).toLocaleString()}</p>
                      {selectedIssue.resolution_notes && (
                        <p><strong>Notes:</strong> {selectedIssue.resolution_notes}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
                  <p><strong>Reported:</strong> {new Date(selectedIssue.created_at).toLocaleString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(selectedIssue.updated_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6">
                <button
                  onClick={closeModal}
                  className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReportedIssues;
