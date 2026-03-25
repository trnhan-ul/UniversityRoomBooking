import React, { useState, useEffect } from "react";
import { getDashboardStats } from "../services/dashboardService";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    usersTrend: "0%",
    monthlyBookings: 0,
    bookingsTrend: "0%",
    utilization: "0%",
    utilizationTrend: "0%",
    pendingBookings: 0,
    totalRooms: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topRooms, setTopRooms] = useState([]);
  const [userRoleData, setUserRoleData] = useState([]);
  const [bookingVolume, setBookingVolume] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardStats();
      if (response.success) {
        const d = response.data;
        setAnalytics({
          totalUsers: d.totalUsers,
          usersTrend: d.usersTrend,
          monthlyBookings: d.monthlyBookings,
          bookingsTrend: d.bookingsTrend,
          utilization: d.utilization,
          utilizationTrend: d.utilizationTrend,
          pendingBookings: d.pendingBookings,
          totalRooms: d.totalRooms,
        });
        setRecentActivity(d.recentActivity || []);
        setTopRooms(d.topRooms || []);
        setBookingVolume(d.bookingVolume || []);

        const roleColors = {
          STUDENT: "bg-primary",
          LECTURER: "bg-amber-400",
          ADMINISTRATOR: "bg-slate-600",
          FACILITY_MANAGER: "bg-emerald-500",
        };
        const roleLabels = {
          STUDENT: "Students",
          LECTURER: "Lecturers",
          ADMINISTRATOR: "Admins",
          FACILITY_MANAGER: "Managers",
        };
        setUserRoleData(
          (d.roleDistribution || []).map((r) => ({
            role: roleLabels[r.role] || r.role,
            percentage: r.percentage,
            color: roleColors[r.role] || "bg-slate-300",
          })),
        );
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "booking":
        return "bg-blue-50 text-primary";
      case "user":
        return "bg-green-50 text-green-600";
      case "alert":
        return "bg-amber-50 text-amber-600";
      default:
        return "bg-slate-50";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "High":
        return "bg-red-50 text-red-600";
      case "Med":
        return "bg-amber-50 text-amber-600";
      default:
        return "bg-green-50 text-green-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center p-8 bg-white rounded-xl border border-red-200 max-w-md">
          <span className="material-symbols-outlined text-red-500 text-4xl mb-3">
            error
          </span>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Failed to load dashboard
          </h3>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold text-slate-900">
              Analytics Overview
            </h2>
            <div className="max-w-md w-full ml-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search metrics, users, or rooms..."
                  className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Breadcrumbs & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <nav className="flex items-center gap-2 text-sm">
              <button
                type="button"
                className="text-slate-500 hover:text-primary"
              >
                Home
              </button>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-900">Dashboard</span>
            </nav>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              <button className="flex h-9 items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <span>All Campuses</span>
                <span className="material-symbols-outlined text-lg">
                  expand_more
                </span>
              </button>
              <button className="flex h-9 items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <span>Faculty: Science</span>
                <span className="material-symbols-outlined text-lg">
                  expand_more
                </span>
              </button>
              <button className="flex h-9 items-center gap-2 rounded-lg bg-primary text-white px-4 text-sm font-medium hover:bg-blue-700 transition-colors">
                <span className="material-symbols-outlined text-lg">
                  calendar_today
                </span>
                <span>This Quarter</span>
                <span className="material-symbols-outlined text-lg">
                  expand_more
                </span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                  {analytics.usersTrend}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {analytics.totalUsers.toLocaleString()}
              </h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <span className="material-symbols-outlined">
                    event_available
                  </span>
                </div>
                <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                  {analytics.bookingsTrend}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                Monthly Bookings
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {analytics.monthlyBookings.toLocaleString()}
              </h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <span className="material-symbols-outlined">pie_chart</span>
                </div>
                <span className="text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">
                  {analytics.utilizationTrend}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                Resource Utilization
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {analytics.utilization}
              </h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <span className="material-symbols-outlined">
                    pending_actions
                  </span>
                </div>
                <span className="text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded-full">
                  Needs Review
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                Pending Bookings
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {analytics.pendingBookings.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Visualization Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking Volume Trends */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-base font-bold text-slate-900">
                  Booking Volume Trends
                </h4>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-semibold bg-slate-100 rounded hover:bg-slate-200 transition-colors">
                    Daily
                  </button>
                  <button className="px-3 py-1 text-xs font-semibold bg-primary text-white rounded shadow-md hover:bg-blue-700 transition-colors">
                    Monthly
                  </button>
                </div>
              </div>
              <div className="relative h-64 w-full bg-slate-50 rounded-lg overflow-hidden flex items-end px-4 gap-2">
                <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-slate-200 w-full"></div>
                  <div className="border-b border-slate-200 w-full"></div>
                  <div className="border-b border-slate-200 w-full"></div>
                  <div className="border-b border-slate-200 w-full"></div>
                </div>
                <div className="relative w-full h-full flex items-end justify-between px-4 pb-4">
                  {bookingVolume.map((item, idx) => {
                    const maxCount = Math.max(
                      ...bookingVolume.map((v) => v.count),
                      1,
                    );
                    const heightPct = Math.max(
                      (item.count / maxCount) * 100,
                      2,
                    );
                    return (
                      <div
                        key={idx}
                        className="w-8 bg-primary/60 rounded-t-sm hover:bg-primary transition-colors relative group"
                        style={{ height: `${heightPct}%` }}
                        title={`${item.month}: ${item.count} bookings`}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 flex justify-between text-xs text-slate-400 font-medium">
                {bookingVolume.map((item, idx) => (
                  <span key={idx}>{item.month}</span>
                ))}
              </div>
            </div>

            {/* User Role Distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 mb-6">
                User Role Distribution
              </h4>
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 rounded-full border-[16px] border-slate-100 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[16px] border-primary border-r-transparent border-b-transparent border-l-transparent"></div>
                  <div className="absolute inset-0 rounded-full border-[16px] border-amber-400 border-t-transparent border-r-transparent border-l-transparent rotate-45"></div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {analytics.totalUsers >= 1000
                        ? `${(analytics.totalUsers / 1000).toFixed(1)}k`
                        : analytics.totalUsers}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      Total Users
                    </p>
                  </div>
                </div>
                <div className="mt-8 w-full space-y-3">
                  {userRoleData.map((data, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${data.color}`}
                        ></span>
                        <span className="text-slate-600">{data.role}</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {data.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Top Rooms */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
            {/* Recent System Activity */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-base font-bold text-slate-900">
                  Recent System Activity
                </h4>
                <button
                  type="button"
                  className="text-sm text-primary font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getActivityIcon(
                        activity.type,
                      )}`}
                    >
                      <span className="material-symbols-outlined">
                        {activity.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {activity.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top High-Utilization Rooms */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-base font-bold text-slate-900">
                  Top 5 High-Utilization Rooms
                </h4>
                <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-slate-600">
                  more_horiz
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Room Name
                      </th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Capacity
                      </th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Utilization
                      </th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topRooms.map((room) => (
                      <tr
                        key={room.id}
                        className="text-sm hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 font-semibold text-slate-900">
                          {room.name}
                        </td>
                        <td className="py-4 text-slate-500">{room.capacity}</td>
                        <td className="py-4">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full transition-all"
                              style={{ width: `${room.utilization}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-1 ${getStatusBadgeColor(
                              room.status,
                            )} text-[10px] font-bold rounded uppercase tracking-wide`}
                          >
                            {room.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
