import React from 'react';

const Header = ({ user }) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-10 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 text-blue-600">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-lg">
            <span className="text-xl">🏫</span>
          </div>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold">UniBooking</h2>
        </div>
        <nav className="flex items-center gap-9">
          <a className="text-gray-600 dark:text-gray-300 text-sm font-medium hover:text-blue-600 transition-colors" href="/dashboard">
            Dashboard
          </a>
          <a className="text-gray-600 dark:text-gray-300 text-sm font-medium hover:text-blue-600 transition-colors" href="/book">
            Book a Room
          </a>
          <a className="text-blue-600 text-sm font-bold" href="/my-bookings">
            My Bookings
          </a>
          <a className="text-gray-600 dark:text-gray-300 text-sm font-medium hover:text-blue-600 transition-colors" href="/settings">
            Settings
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          {user?.full_name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Header;
