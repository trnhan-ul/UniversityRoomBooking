import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../common/NotificationBell';
import { useAuthContext } from '../../context/AuthContext';

const Header = ({ user: userProp }) => {
  const { user: ctxUser, logout } = useAuthContext();
  const user = userProp || ctxUser;
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate('/my-profile');
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 bg-white px-10 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 text-blue-600">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-lg">
            <span className="text-xl">🏫</span>
          </div>
          <h2 className="text-gray-900 text-lg font-bold">UniBooking SaaS</h2>
        </div>
        <nav className="flex items-center gap-9">
          <a className="text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors" href="/dashboard">
            Dashboard
          </a>
          <a className="text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors" href="/create-booking">
            Book a Room
          </a>
          <a className="text-blue-600 text-sm font-bold" href="/my-bookings">
            My Bookings
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Global search..."
            className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        <NotificationBell />

        {/* Avatar with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
              {/* Actions */}
              <button
                onClick={handleProfile}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="material-symbols-outlined text-gray-500" style={{ fontSize: 18 }}>person</span>
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <span className="material-symbols-outlined text-red-500" style={{ fontSize: 18 }}>logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

