import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdministratorDashboard = () => {
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
              <div className="bg-red-600 p-2 rounded-lg text-white">
                <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administrator Dashboard</h1>
                <p className="text-sm text-gray-500">System Configuration & User Management</p>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Administrator Information</h2>
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatsCard icon="people" title="Total Users" value="245" color="blue" />
          <StatsCard icon="meeting_room" title="Total Rooms" value="32" color="green" />
          <StatsCard icon="event" title="Active Bookings" value="128" color="orange" />
          <StatsCard icon="check_circle" title="Completed" value="1,234" color="purple" />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon="manage_accounts"
            title="User Management"
            description="View and manage all user accounts"
            color="red"
          />
          <FeatureCard
            icon="assignment_ind"
            title="Assign Roles"
            description="Assign and modify user roles"
            color="blue"
          />
          <FeatureCard
            icon="person_add"
            title="Create Users"
            description="Add new users to the system"
            color="green"
          />
          <FeatureCard
            icon="toggle_on"
            title="Activate/Deactivate"
            description="Manage user account status"
            color="orange"
          />
          <FeatureCard
            icon="analytics"
            title="System Reports"
            description="View system-wide statistics"
            color="purple"
          />
          <FeatureCard
            icon="assessment"
            title="Usage Analytics"
            description="Analyze booking patterns"
            color="indigo"
          />
          <FeatureCard
            icon="settings"
            title="System Settings"
            description="Configure booking rules and settings"
            color="gray"
          />
          <FeatureCard
            icon="schedule"
            title="Booking Rules"
            description="Set booking time restrictions"
            color="teal"
          />
          <FeatureCard
            icon="notification_important"
            title="System Logs"
            description="View audit logs and activities"
            color="pink"
          />
        </div>
      </main>
    </div>
  );
};

const StatsCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    purple: 'bg-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center text-white`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
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

export default AdministratorDashboard;
