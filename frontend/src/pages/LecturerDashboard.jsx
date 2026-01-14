import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LecturerDashboard = () => {
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
              <div className="bg-green-600 p-2 rounded-lg text-white">
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lecturer Dashboard</h1>
                <p className="text-sm text-gray-500">Teaching & Room Management</p>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lecturer Information</h2>
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
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
            icon="meeting_room"
            title="Book Classroom"
            description="Book rooms for teaching activities"
            color="green"
          />
          <FeatureCard
            icon="calendar_today"
            title="Teaching Schedule"
            description="View your teaching and booking schedule"
            color="blue"
          />
          <FeatureCard
            icon="assignment"
            title="My Bookings"
            description="Manage your classroom bookings"
            color="purple"
          />
          <FeatureCard
            icon="assessment"
            title="Usage Reports"
            description="View your room usage statistics"
            color="orange"
          />
          <FeatureCard
            icon="history"
            title="Booking History"
            description="View past classroom bookings"
            color="gray"
          />
          <FeatureCard
            icon="notifications_active"
            title="Notifications"
            description="Booking status and updates"
            color="red"
          />
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    red: 'bg-red-50 text-red-600 hover:bg-red-100',
    gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default LecturerDashboard;
