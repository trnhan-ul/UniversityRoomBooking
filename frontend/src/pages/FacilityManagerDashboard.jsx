import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FacilityManagerDashboard = () => {
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
              <div className="bg-purple-600 p-2 rounded-lg text-white">
                <span className="material-symbols-outlined text-2xl">domain</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Facility Manager Dashboard</h1>
                <p className="text-sm text-gray-500">Classroom & Equipment Management</p>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager Information</h2>
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
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
            icon="add_business"
            title="Manage Classrooms"
            description="Create, update, and delete classrooms"
            color="purple"
          />
          <FeatureCard
            icon="devices"
            title="Manage Equipment"
            description="Manage classroom equipment inventory"
            color="blue"
          />
          <FeatureCard
            icon="task_alt"
            title="Approve Bookings"
            description="Review and approve booking requests"
            color="green"
          />
          <FeatureCard
            icon="cancel"
            title="Reject Bookings"
            description="Review and reject invalid bookings"
            color="red"
          />
          <FeatureCard
            icon="view_list"
            title="All Bookings"
            description="View all booking requests in system"
            color="orange"
          />
          <FeatureCard
            icon="event_available"
            title="Room Schedules"
            description="Manage and view classroom schedules"
            color="teal"
          />
          <FeatureCard
            icon="analytics"
            title="Usage Reports"
            description="View room utilization statistics"
            color="indigo"
          />
          <FeatureCard
            icon="settings"
            title="Room Settings"
            description="Configure room availability settings"
            color="gray"
          />
          <FeatureCard
            icon="notifications"
            title="Notifications"
            description="System and booking notifications"
            color="pink"
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
    teal: 'bg-teal-50 text-teal-600 hover:bg-teal-100',
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    pink: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
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

export default FacilityManagerDashboard;
