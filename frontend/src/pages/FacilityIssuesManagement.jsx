import React, { useState, useEffect } from 'react';
import {
  getAllFacilityIssues,
  updateFacilityIssueStatus,
  deleteFacilityIssue,
  getFacilityIssueStats,
  getFacilityIssueById
} from '../services/facilityIssueService';

const FacilityIssuesManagement = () => {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Notification popup state
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    issue_type: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  
  // Selected issue for modal
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Update status form
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: '',
    admin_notes: '',
    resolution_notes: ''
  });

  // Show notification popup
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const fetchStats = async () => {
    try {
      const response = await getFacilityIssueStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await getAllFacilityIssues(filters);
      
      if (response.success) {
        setIssues(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to fetch issues', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const viewIssueDetails = async (issueId) => {
    try {
      const response = await getFacilityIssueById(issueId);
      if (response.success) {
        setSelectedIssue(response.data);
        setStatusUpdateForm({
          status: response.data.status,
          admin_notes: response.data.admin_notes || '',
          resolution_notes: response.data.resolution_notes || ''
        });
        setShowModal(true);
      }
    } catch (err) {
      showNotification('Failed to load issue details', 'error');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    try {
      const response = await updateFacilityIssueStatus(selectedIssue._id, statusUpdateForm);
      
      if (response.success) {
        showNotification('Status updated successfully', 'success');
        setShowModal(false);
        fetchIssues();
        fetchStats();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;

    try {
      const response = await deleteFacilityIssue(issueId);
      
      if (response.success) {
        showNotification('Issue deleted successfully', 'success');
        setShowModal(false);
        fetchIssues();
        fetchStats();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to delete issue', 'error');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedIssue(null);
    setStatusUpdateForm({ status: '', admin_notes: '', resolution_notes: '' });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to page 1 when filtering
    }));
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
      LOW: 'text-green-600 bg-green-50',
      MEDIUM: 'text-yellow-600 bg-yellow-50',
      HIGH: 'text-orange-600 bg-orange-50',
      CRITICAL: 'text-red-600 bg-red-50'
    };
    return colors[severity] || 'text-gray-600 bg-gray-50';
  };

  const statuses = ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const issueTypes = ['EQUIPMENT_DAMAGE', 'FACILITY_DAMAGE', 'CLEANLINESS', 'SAFETY', 'OTHER'];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Facility Issues Management</h1>
          <p className="mt-2 text-gray-600">Monitor and manage reported facility issues</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Issues</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
              <div className="text-sm font-medium text-yellow-800 mb-1">Open Issues</div>
              <div className="text-3xl font-bold text-yellow-900">{stats.open}</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
              <div className="text-sm font-medium text-green-800 mb-1">Resolved</div>
              <div className="text-3xl font-bold text-green-900">{stats.resolved}</div>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
              <div className="text-sm font-medium text-red-800 mb-1">Critical</div>
              <div className="text-3xl font-bold text-red-900">{stats.bySeverity?.CRITICAL || 0}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Severities</option>
                {severities.map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
              <select
                value={filters.issue_type}
                onChange={(e) => handleFilterChange('issue_type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {issueTypes.map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', severity: '', issue_type: '', page: 1, limit: 10 })}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Issues Table */}
        {loading ? (
          <div className="bg-white shadow-md rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-lg">No issues found</p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {issues.map((issue) => (
                      <tr key={issue._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                          <div className="text-sm text-gray-500">
                            {issue.room_id?.room_code} - {issue.room_id?.room_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {issue.issue_type.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                            {issue.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {issue.reported_by?.full_name || issue.reported_by?.username}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(issue.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => viewIssueDetails(issue._id)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {filters.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={filters.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail & Update Modal */}
      {showModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Issue Details & Management</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Issue Details (same as MyReportedIssues but with update form) */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedIssue.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Room:</strong> {selectedIssue.room_id?.room_code} - {selectedIssue.room_id?.room_name}</p>
                      <p><strong>Location:</strong> {selectedIssue.room_id?.location}</p>
                      <p><strong>Type:</strong> {selectedIssue.issue_type.replace('_', ' ')}</p>
                      {selectedIssue.equipment_id && (
                        <p><strong>Equipment:</strong> {selectedIssue.equipment_id.name}</p>
                      )}
                      {selectedIssue.location && (
                        <p><strong>Location:</strong> {selectedIssue.location}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-block ml-2 px-4 py-2 rounded-lg text-sm font-semibold ${getSeverityColor(selectedIssue.severity)}`}>
                      {selectedIssue.severity}
                    </span>
                    <div className="text-sm text-gray-600">
                      <p><strong>Reported by:</strong> {selectedIssue.reported_by?.full_name || selectedIssue.reported_by?.username}</p>
                      <p><strong>Date:</strong> {new Date(selectedIssue.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedIssue.description}</p>
                </div>

                {selectedIssue.images && selectedIssue.images.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Images</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedIssue.images.map((img, index) => (
                        <img key={index} src={img} alt={`Issue ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Update Status Form */}
                <form onSubmit={handleUpdateStatus} className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Update Issue Status</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusUpdateForm.status}
                      onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                    <textarea
                      value={statusUpdateForm.admin_notes}
                      onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Add notes for internal tracking..."
                    />
                  </div>

                  {statusUpdateForm.status === 'RESOLVED' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Notes</label>
                      <textarea
                        value={statusUpdateForm.resolution_notes}
                        onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, resolution_notes: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe how the issue was resolved..."
                        required
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Update Status
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteIssue(selectedIssue._id)}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Delete Issue
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Popup */}
      {notification.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-24">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fadeIn">
            <div className="p-6">
              <div className="flex items-start mb-4">
                {notification.type === 'success' ? (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {notification.type === 'success' ? 'Success' : 'Error'}
                  </h3>
                  <p className="text-gray-600">{notification.message}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityIssuesManagement;
