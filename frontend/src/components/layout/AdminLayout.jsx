import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: "📊",
      label: "Dashboard",
      roles: ["ADMINISTRATOR", "FACILITY_MANAGER"],
    },
    {
      path: "/user-management",
      icon: "👥",
      label: "User Management",
      roles: ["ADMINISTRATOR"],
    },
    {
      path: "/pending-requests",
      icon: "⏳",
      label: "Pending Requests",
      roles: ["ADMINISTRATOR", "FACILITY_MANAGER"],
    },
    {
      path: "/room-inventory",
      icon: "🏛️",
      label: "Room Inventory",
      roles: ["ADMINISTRATOR", "FACILITY_MANAGER"],
    },
    {
      path: "/schedule-management",
      icon: "📅",
      label: "Schedule Management",
      roles: ["ADMINISTRATOR", "FACILITY_MANAGER"],
    },
    {
      path: "/booking-report",
      icon: "📈",
      label: "Reports",
      roles: ["ADMINISTRATOR", "FACILITY_MANAGER"],
    },
    {
      path: "/settings",
      icon: "⚙️",
      label: "Settings",
      roles: ["ADMINISTRATOR", "FACILITY_MANAGER"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

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
                Super Admin Console
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

        {/* Support Center Button */}
        <div className="p-4 border-t border-slate-200">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <span className="text-lg">🎧</span>
            <span className="text-sm font-medium">Support Center</span>
          </button>
        </div>

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
