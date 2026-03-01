import React, { useState, useEffect } from "react";
import { getRoomUsageReport, getRooms } from "../services/roomService";

const RoomUsageReport = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allRooms, setAllRooms] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
    roomId: "",
  });

  // Get default date range (current month)
  function getDefaultStartDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }

  function getDefaultEndDate() {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
  }

  function getTodayDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  // Fetch all rooms for dropdown
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await getRooms();
        if (response.success) {
          setAllRooms(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };
    fetchRooms();
  }, []);

  // Fetch report data
  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getRoomUsageReport(filters);
      if (response.success) {
        setReportData(response.data.rooms);
        setSummary(response.data.summary);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch room usage report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    // Clear error when user changes filters
    if (error) setError("");
  };

  const validateFilters = () => {
    // Check if dates are provided
    if (!filters.startDate || !filters.endDate) {
      setError("Please select both start date and end date");
      return false;
    }

    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError("Invalid date format");
      return false;
    }

    // Check if end date is after start date
    if (endDate < startDate) {
      setError("End date must be equal to or after start date");
      return false;
    }

    // Check if dates are not in the future
    if (startDate > today) {
      setError("Start date cannot be in the future");
      return false;
    }

    if (endDate > today) {
      setError("End date cannot be in the future");
      return false;
    }

    // Check if date range is not too long (max 1 year)
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      setError("Date range cannot exceed 365 days");
      return false;
    }

    return true;
  };

  const handleApplyFilters = () => {
    if (validateFilters()) {
      fetchReport();
    }
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: getDefaultStartDate(),
      endDate: getDefaultEndDate(),
      roomId: "",
    });
    setTimeout(() => fetchReport(), 100);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Room Usage Report</h1>
          {summary && (
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {summary.totalRooms || 0} Rooms
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
                  <p className="text-xs text-slate-500 mb-1">Total Rooms</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {summary.totalRooms || 0}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {summary.totalBookings || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-600 mb-1">Period</p>
                  <p className="text-sm font-medium text-purple-700">
                    {summary.period?.totalDays || 0} days
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {summary.period?.start} to {summary.period?.end}
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
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  max={getTodayDate()}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  max={getTodayDate()}
                  min={filters.startDate}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room (Optional)
                </label>
                <select
                  name="roomId"
                  value={filters.roomId}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Rooms</option>
                  {allRooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.room_code} - {room.room_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Apply Filters
              </button>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                Reset
              </button>
            </div>
          </div>

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
                <h2 className="text-lg font-bold">Room Usage Statistics</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                        Room Code
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                        Room Name
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">
                        Location
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase text-right">
                        Capacity
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase text-right">
                        Bookings
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase text-right">
                        Total Hours
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase text-right">
                        Days Booked
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase text-right">
                        Avg Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          No data available for the selected period
                        </td>
                      </tr>
                    ) : (
                      reportData.map((room) => (
                        <tr key={room.roomId} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-blue-600">
                            {room.roomCode}
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {room.roomName}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {room.location}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-600">
                            {room.capacity}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">
                            {room.statistics.totalBookings}
                          </td>
                          <td className="px-6 py-4 text-right text-blue-600 font-medium">
                            {room.statistics.totalHours}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-600">
                            {room.statistics.daysBooked}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-600">
                            {room.statistics.averageBookingDuration}
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

export default RoomUsageReport;
