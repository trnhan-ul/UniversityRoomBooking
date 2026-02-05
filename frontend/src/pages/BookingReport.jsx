import React, { useState, useEffect } from "react";
import { getBookingReport } from "../services/bookingService";

const BookingReport = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const groupBy = "date";

  // Fetch report data
  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getBookingReport({ groupBy });
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
    fetchReport();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                  Report Data {groupBy === "date" && "(By Date)"}
                  {groupBy === "room" && "(By Room)"}
                  {groupBy === "status" && "(By Status)"}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                        Date
                      </th>
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
                          No data available
                        </td>
                      </tr>
                    ) : (
                      reportData.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium">
                            {row._id?.date || "N/A"}
                          </td>
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
