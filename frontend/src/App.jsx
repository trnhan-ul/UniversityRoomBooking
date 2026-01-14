import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common';
import {
  Login,
  StudentDashboard,
  LecturerDashboard,
  FacilityManagerDashboard,
  AdministratorDashboard
} from './pages';

function App() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected Routes */}
        {user && user.role === "ADMIN" && (
          <>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/user-management" element={<UserManagement />} />
          </>
        )}

        {user && (user.role === "STAFF" || user.role === "ADMIN") && (
          <Route path="/pending-requests" element={<PendingRequests />} />
        )}

        {user && (
          <>
            <Route
              path="/homepage"
              element={
                user.role === "ADMIN" ? <AdminDashboard /> : <MyBookings />
              }
            />
            <Route path="/my-bookings" element={<MyBookings />} />
          </>
        )}

        {/* Fallback */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
