import React, { useState, useEffect } from "react";
import { getBookingReport } from "../services/bookingService";

const BookingReport = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [groupBy, setGroupBy] = useState("date");

  // Fetch report data
  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (status) filters.status = status;
      filters.groupBy = groupBy;

      const response = await getBookingReport(filters);
      if (response.success) {
        setReportData(response.data.report);
        setSummary(response.data.summary);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterApply = () => {
    fetchReport();
  };

  const handleReset = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
    setStatus("");
    setGroupBy("date");
  };

  const getStatusBadgeClass = (statusValue) => {
    const classes = {
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      CANCELLED: "bg-gray-100 text-gray-700",
    };
    return classes[statusValue] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Booking Report</h1>
          {summary && (
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {summary.totalBookings || 0} Total Bookings
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Summary */}
        <aside className="w-80 border-r border-slate-200 bg-white p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Summary Statistics
            </h3>
            {summary ? (
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {summary.totalBookings || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-xs text-green-600 mb-1">Approved</p>
                  <p className="text-xl font-bold text-green-700">
                    {summary.approved || 0}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-600 mb-1">Pending</p>
                  <p className="text-xl font-bold text-yellow-700">
                    {summary.pending || 0}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-xs text-red-600 mb-1">Rejected</p>
                  <p className="text-xl font-bold text-red-700">
                    {summary.rejected || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Cancelled</p>
                  <p className="text-xl font-bold text-gray-700">
                    {summary.cancelled || 0}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No data available</p>
            )}
          </div>

          {/* Filters */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Filters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">All Status</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Group By
                </label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="date">By Date</option>
                  <option value="room">By Room</option>
                  <option value="status">By Status</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleFilterApply}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                >
                  Apply
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
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
              <div className="text-slate-500">Loading report data...</div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold">
                  Report Data{" "}
                  {groupBy === "date" && "(By Date)"}
                  {groupBy === "room" && "(By Room)"}
                  {groupBy === "status" && "(By Status)"}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {groupBy === "date" && (
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                          Date
                        </th>
                      )}
                      {groupBy === "room" && (
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                          Room
                        </th>
                      )}
                      {groupBy === "status" && (
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                          Status
                        </th>
                      )}
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                        Total
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                        Approved
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                        Pending
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                        Rejected
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                        Cancelled
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          No data available for the selected filters
                        </td>
                      </tr>
                    ) : (
                      reportData.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          {groupBy === "date" && (
                            <td className="px-6 py-4 font-medium">
                              {row._id?.date || "N/A"}
                            </td>
                          )}
                          {groupBy === "room" && (
                            <td className="px-6 py-4 font-medium">
                              {row._id?.room_name || "N/A"}
                            </td>
                          )}
                          {groupBy === "status" && (
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(
                                  row._id?.status,
                                )}`}
                              >
                                {row._id?.status || "N/A"}
                              </span>
                            </td>
                          )}
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {row.total}
                          </td>
                          <td className="px-6 py-4 text-green-600">
                            {row.approved || 0}
                          </td>
                          <td className="px-6 py-4 text-yellow-600">
                            {row.pending || 0}
                          </td>
                          <td className="px-6 py-4 text-red-600">
                            {row.rejected || 0}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {row.cancelled || 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookingReport;
