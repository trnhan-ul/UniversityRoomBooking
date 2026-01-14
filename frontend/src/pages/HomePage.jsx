import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-500">Room Booking System</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome Back!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-base font-medium text-gray-900">{user?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {user?.role}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {user?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon="search"
            title="Search Rooms"
            description="Find available classrooms for your schedule"
            color="blue"
            onClick={() => navigate('/rooms')}
          />
          <FeatureCard
            icon="book_online"
            title="Book Room"
            description="Create a new room booking request"
            color="green"
            onClick={() => navigate('/create-booking')}
          />
          <FeatureCard
            icon="calendar_month"
            title="My Bookings"
            description="View and manage your booking requests"
            color="purple"
            onClick={() => navigate('/my-bookings')}
          />
          <FeatureCard
            icon="schedule"
            title="My Schedule"
            description="Check your personal booking schedule"
            color="orange"
          />
          <FeatureCard
            icon="notifications"
            title="Notifications"
            description="View booking status notifications"
            color="red"
          />
          <FeatureCard
            icon="history"
            title="Booking History"
            description="View your past bookings"
            color="gray"
          />
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    red: 'bg-red-50 text-red-600 hover:bg-red-100',
    gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default StudentDashboard;
