import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "../common/NotificationBell";
import { useAuthContext } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/homepage", label: "Home" },
  { to: "/search-classrooms", label: "Classrooms" },
  { to: "/create-booking", label: "Book Room" },
  { to: "/my-bookings", label: "My Bookings" },
  { to: "/notifications", label: "Notifications" },
  { to: "/report-issue", label: "Report Issue" },
];

const NAV_ACTIVE_MATCHERS = {
  "/homepage": ["/homepage", "/dashboard"],
  "/search-classrooms": ["/search-classrooms", "/classroom-details"],
  "/create-booking": ["/create-booking"],
  "/my-bookings": ["/my-bookings", "/bookings/", "/booking-detail/"],
  "/notifications": ["/notifications"],
  "/report-issue": ["/report-issue", "/my-reported-issues"],
};

const Header = ({ user: userProp }) => {
  const { user: ctxUser, logout } = useAuthContext();
  const user = userProp || ctxUser;
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getNavClassName = (to) => {
    const matchers = NAV_ACTIVE_MATCHERS[to] || [to];
    const isActive = matchers.some((path) =>
      path.endsWith("/")
        ? location.pathname.startsWith(path)
        : location.pathname === path,
    );

    return isActive
      ? "text-blue-600 text-sm font-bold"
      : "text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate("/my-profile");
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <div className="flex items-center gap-3 text-blue-600 sm:gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-xl">🏫</span>
              </div>
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                UniBooking
              </h2>
            </div>
            <nav className="hidden items-center gap-4 lg:flex xl:gap-7">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  className={getNavClassName(item.to)}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {user?.full_name || "User"}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {user?.email || ""}
                    </p>
                  </div>

                  <button
                    onClick={handleProfile}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <span
                      className="material-symbols-outlined text-gray-500"
                      style={{ fontSize: 18 }}
                    >
                      person
                    </span>
                    My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <span
                      className="material-symbols-outlined text-red-500"
                      style={{ fontSize: 18 }}
                    >
                      logout
                    </span>
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-slate-100 lg:hidden"
              aria-label="Toggle navigation"
            >
              <span className="material-symbols-outlined">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="mt-3 flex flex-wrap items-center gap-2 lg:hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                className={getNavClassName(item.to)}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;

