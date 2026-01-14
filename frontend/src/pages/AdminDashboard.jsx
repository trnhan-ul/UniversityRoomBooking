import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuthContext();
  const [analytics] = useState({
    totalUsers: 12450,
    usersTrend: "+5.2%",
    monthlyBookings: 3200,
    bookingsTrend: "+12.4%",
    utilization: "78.5%",
    utilizationTrend: "-2.1%",
    uptime: "99.9%",
  });

  const [recentActivity] = useState([
    {
      id: 1,
      type: "booking",
      title: "New Booking Request",
      description: "Dr. Sarah Jenkins requested Room 402B for Bio Seminar",
      time: "2 minutes ago",
      icon: "add_circle",
    },
    {
      id: 2,
      type: "user",
      title: "New Student Registered",
      description: "24 new students from Faculty of Arts joined the platform",
      time: "1 hour ago",
      icon: "person_add",
    },
    {
      id: 3,
      type: "alert",
      title: "Resource Alert",
      description: "Central Lab reached 95% capacity for the upcoming week",
      time: "4 hours ago",
      icon: "warning",
    },
  ]);

  const [topRooms] = useState([
    {
      id: 1,
      name: "Main Auditorium A",
      capacity: 500,
      utilization: 94,
      status: "High",
    },
    { id: 2, name: "Bio Lab 3", capacity: 45, utilization: 88, status: "High" },
    {
      id: 3,
      name: "Tech Seminar Room",
      capacity: 120,
      utilization: 82,
      status: "Med",
    },
  ]);

  const userRoleData = [
    { role: "Students", percentage: 65, color: "bg-primary" },
    { role: "Lecturers", percentage: 28, color: "bg-amber-400" },
    { role: "Admins", percentage: 7, color: "bg-slate-300" },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "booking":
        return "bg-blue-50 dark:bg-blue-900/30 text-primary";
      case "user":
        return "bg-green-50 dark:bg-green-900/30 text-green-600";
      case "alert":
        return "bg-amber-50 dark:bg-amber-900/30 text-amber-600";
      default:
        return "bg-slate-50 dark:bg-slate-900/30";
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

  const navigationItems = [
    { label: "Dashboard", icon: "dashboard", active: true, action: null },
    {
      label: "User Management",
      icon: "group",
      active: false,
      action: () => navigate("/user-management"),
    },
    {
      label: "Room Inventory",
      icon: "meeting_room",
      active: false,
      action: null,
    },
    { label: "Reports", icon: "analytics", active: false, action: null },
    { label: "Settings", icon: "settings", active: false, action: null },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: "System Admin",
      STAFF: "Department Manager",
      TEACHER: "Lecturer",
      STUDENT: "Student",
    };
    return labels[role] || role;
  };

  return (
    <div className="light min-h-screen flex bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col h-screen sticky top-0 shadow-sm">
        <div className="p-6 flex flex-col gap-8 h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2 text-white">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight">
                UniBooking SaaS
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">
                Super Admin Console
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 flex-grow">
            {navigationItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                disabled={!item.action}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  item.active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Support Button */}
          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
            <button className="w-full bg-primary text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              <span className="material-symbols-outlined text-sm">
                support_agent
              </span>
              Support Center
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
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
                  className="w-full bg-slate-100 dark:bg-slate-700 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 dark:text-white dark:placeholder-slate-400"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-700 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {currentUser?.full_name || currentUser?.email || "Admin"}
                </p>
                <p className="text-xs text-slate-500">
                  {getRoleLabel(currentUser?.role)}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
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
              <span className="font-medium text-slate-900 dark:text-white">
                Dashboard
              </span>
            </nav>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              <button className="flex h-9 items-center gap-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <span>All Campuses</span>
                <span className="material-symbols-outlined text-lg">
                  expand_more
                </span>
              </button>
              <button className="flex h-9 items-center gap-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
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
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <span className="text-green-600 text-xs font-bold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  {analytics.usersTrend}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Total Users
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {analytics.totalUsers.toLocaleString()}
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600">
                  <span className="material-symbols-outlined">
                    event_available
                  </span>
                </div>
                <span className="text-green-600 text-xs font-bold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  {analytics.bookingsTrend}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Monthly Bookings
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {analytics.monthlyBookings.toLocaleString()}
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600">
                  <span className="material-symbols-outlined">pie_chart</span>
                </div>
                <span className="text-red-600 text-xs font-bold bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
                  {analytics.utilizationTrend}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Resource Utilization
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {analytics.utilization}
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                  <span className="material-symbols-outlined">done_all</span>
                </div>
                <span className="text-slate-400 text-xs font-bold">Stable</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                System Uptime
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {analytics.uptime}
              </h3>
            </div>
          </div>

          {/* Visualization Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking Volume Trends */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Booking Volume Trends
                </h4>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    Daily
                  </button>
                  <button className="px-3 py-1 text-xs font-semibold bg-primary text-white rounded shadow-md hover:bg-blue-700 transition-colors">
                    Monthly
                  </button>
                </div>
              </div>
              <div className="relative h-64 w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg overflow-hidden flex items-end px-4 gap-2">
                <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-slate-200 dark:border-slate-700 w-full"></div>
                  <div className="border-b border-slate-200 dark:border-slate-700 w-full"></div>
                  <div className="border-b border-slate-200 dark:border-slate-700 w-full"></div>
                  <div className="border-b border-slate-200 dark:border-slate-700 w-full"></div>
                </div>
                <div className="relative w-full h-full flex items-end justify-between px-4 pb-4">
                  <div className="w-8 bg-primary/20 rounded-t-sm h-[40%] hover:bg-primary/40 transition-colors"></div>
                  <div className="w-8 bg-primary/40 rounded-t-sm h-[60%] hover:bg-primary/60 transition-colors"></div>
                  <div className="w-8 bg-primary/60 rounded-t-sm h-[80%] hover:bg-primary/80 transition-colors"></div>
                  <div className="w-8 bg-primary/40 rounded-t-sm h-[55%] hover:bg-primary/60 transition-colors"></div>
                  <div className="w-8 bg-primary/80 rounded-t-sm h-[90%] hover:bg-primary transition-colors"></div>
                  <div className="w-8 bg-primary rounded-t-sm h-full hover:bg-blue-700 transition-colors"></div>
                  <div className="w-8 bg-primary/70 rounded-t-sm h-[75%] hover:bg-primary/90 transition-colors"></div>
                </div>
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-primary/40 shadow-[0_0_15px_rgba(19,109,236,0.5)] rotate-[-5deg] transform"></div>
              </div>
              <div className="mt-4 flex justify-between text-xs text-slate-400 font-medium">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
            </div>

            {/* User Role Distribution */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-6">
                User Role Distribution
              </h4>
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 rounded-full border-[16px] border-slate-100 dark:border-slate-700 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[16px] border-primary border-r-transparent border-b-transparent border-l-transparent"></div>
                  <div className="absolute inset-0 rounded-full border-[16px] border-amber-400 border-t-transparent border-r-transparent border-l-transparent rotate-45"></div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      12.4k
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
                        <span className="text-slate-600 dark:text-slate-400">
                          {data.role}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
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
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
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
                        activity.type
                      )}`}
                    >
                      <span className="material-symbols-outlined">
                        {activity.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activity.description}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top High-Utilization Rooms */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Top 5 High-Utilization Rooms
                </h4>
                <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
                  more_horiz
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {topRooms.map((room) => (
                      <tr
                        key={room.id}
                        className="text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="py-4 font-semibold text-slate-900 dark:text-white">
                          {room.name}
                        </td>
                        <td className="py-4 text-slate-500 dark:text-slate-400">
                          {room.capacity}
                        </td>
                        <td className="py-4">
                          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full transition-all"
                              style={{ width: `${room.utilization}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-1 ${getStatusBadgeColor(
                              room.status
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
