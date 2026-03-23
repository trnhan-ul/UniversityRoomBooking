import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const adminMenuItems = [
    { path: "/admin/dashboard", icon: "📊", label: "Admin Dashboard" },
    { path: "/user-management", icon: "👥", label: "User Management" },
    { path: "/working-hours-settings", icon: "🕐", label: "Working Hours" },
    { path: "/room-usage-report", icon: "📊", label: "Room Usage" },
    { path: "/audit-logs", icon: "📋", label: "Audit Logs" },
  ];

  const managerMenuItems = [
    { path: "/manager/dashboard", icon: "📊", label: "Manager Dashboard" },
    { path: "/pending-requests", icon: "⏳", label: "Pending Requests" },
    { path: "/room-inventory", icon: "🏛️", label: "Room Inventory" },
    { path: "/schedule-management", icon: "📅", label: "Schedule Management" },
    {
      path: "/equipment-management",
      icon: "🔧",
      label: "Equipment Management",
    },
    { path: "/booking-report", icon: "📈", label: "Booking Reports" },
    { path: "/holiday-management", icon: "🏖️", label: "Holiday Management" },
    {
      path: "/facility-issues-management",
      icon: "⚠️",
      label: "Facility Issues",
    },
    { path: "/qr-scanner", icon: "📷", label: "QR Check-in" },
  ];

  const filteredMenuItems =
    user?.role === "FACILITY_MANAGER" ? managerMenuItems : adminMenuItems;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-800">
                {user?.role === "FACILITY_MANAGER"
                  ? "Facility Manager Console"
                  : "Administrator Console"}
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
              {user?.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "AD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.full_name || "Admin User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.role?.replace(/_/g, " ") || "Administrator"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
