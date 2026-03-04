import React, { useState, useEffect } from "react";
import { getAuditLogs } from "../services/auditLogService";
import moment from "moment";

const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    action: "",
    target_type: "",
    search: "",
  });

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAuditLogs(filters);
      if (response.success) {
        setAuditLogs(response.data.logs);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filters.page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle filter apply
  const handleFilterApply = () => {
    setFilters({ ...filters, page: 1 });
    fetchAuditLogs();
  };

  // Handle filter reset
  const handleFilterReset = () => {
    setFilters({
      page: 1,
      limit: 20,
      action: "",
      target_type: "",
      search: "",
    });
    setTimeout(() => fetchAuditLogs(), 100);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  // Get action badge style
  const getActionBadgeClass = (action) => {
    const baseClass = "px-2 py-1 rounded-md text-xs font-semibold uppercase";
    switch (action) {
      case "LOGIN":
        return `${baseClass} bg-green-100 text-green-700`;
      case "LOGOUT":
        return `${baseClass} bg-gray-100 text-gray-700`;
      case "APPROVE":
        return `${baseClass} bg-blue-100 text-blue-700`;
      case "REJECT":
        return `${baseClass} bg-red-100 text-red-700`;
      case "CREATE":
        return `${baseClass} bg-purple-100 text-purple-700`;
      case "UPDATE":
        return `${baseClass} bg-yellow-100 text-yellow-700`;
      case "DELETE":
        return `${baseClass} bg-red-100 text-red-700`;
      default:
        return `${baseClass} bg-slate-100 text-slate-700`;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            {pagination.total_items} Total Logs
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Filters */}
        <aside className="w-80 border-r border-slate-200 bg-white p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Filters
            </h3>

            {/* Search */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Search
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                placeholder="Search in description..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>

            {/* Action Filter */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Action
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                value={filters.action}
                onChange={(e) =>
                  setFilters({ ...filters, action: e.target.value })
                }
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="APPROVE">Approve</option>
                <option value="REJECT">Reject</option>
              </select>
            </div>

            {/* Target Type Filter */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Resource Type
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                value={filters.target_type}
                onChange={(e) =>
                  setFilters({ ...filters, target_type: e.target.value })
                }
              >
                <option value="">All Types</option>
                <option value="User">User</option>
                <option value="Room">Room</option>
                <option value="Booking">Booking</option>
                <option value="Equipment">Equipment</option>
                <option value="RoomSchedule">Room Schedule</option>
                <option value="Setting">Setting</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleFilterApply}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                Apply
              </button>
              <button
                onClick={handleFilterReset}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-500">Loading audit logs...</div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                          Timestamp
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                          Action
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                          User
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                          Resource
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-12 text-center text-slate-500"
                          >
                            No audit logs available
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm text-slate-600">
                              <div>
                                {moment(log.created_at).format("MMM D, YYYY")}
                              </div>
                              <div className="text-xs text-slate-400">
                                {moment(log.created_at).format("h:mm:ss A")}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={getActionBadgeClass(log.action)}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-slate-900">
                                {log.user_id?.full_name || "Unknown User"}
                              </div>
                              <div className="text-xs text-slate-500">
                                {log.user_id?.email}
                              </div>
                              <div className="text-xs text-slate-400">
                                {log.user_id?.role}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                                {log.target_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 max-w-md">
                              {log.description}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Showing page {pagination.current_page} of{" "}
                    {pagination.total_pages} (
                    {pagination.total_items} total records)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.current_page - 1)
                      }
                      disabled={pagination.current_page === 1}
                      className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(pagination.current_page + 1)
                      }
                      disabled={
                        pagination.current_page === pagination.total_pages
                      }
                      className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AuditLogs;
