import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import PendingRequests from "./pages/PendingRequests";
import MyBookings from "./pages/MyBookings";
import HomePage from "./pages/HomePage";

function App() {
  const isAdminRole = (role) =>
    role === "ADMINISTRATOR" || role === "FACILITY_MANAGER";

  const getDefaultPath = (role) =>
    isAdminRole(role) ? "/admin/dashboard" : "/homepage";

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
          element={
            !user ? (
              <Login />
            ) : (
              <Navigate to={getDefaultPath(user.role)} replace />
            )
          }
        />

        {/* Protected Routes */}
        {user && isAdminRole(user.role) && (
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        )}

        {user && user.role === "ADMINISTRATOR" && (
          <Route path="/user-management" element={<UserManagement />} />
        )}

        {user &&
          (user.role === "FACILITY_MANAGER" ||
            user.role === "ADMINISTRATOR") && (
            <Route path="/pending-requests" element={<PendingRequests />} />
          )}

        {user && (
          <>
            <Route
              path="/homepage"
              element={
                isAdminRole(user.role) ? <AdminDashboard /> : <HomePage />
              }
            />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route
              path="/dashboard"
              element={<Navigate to={getDefaultPath(user.role)} replace />}
            />
          </>
        )}

        {/* Fallback */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={getDefaultPath(user.role)} replace />
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
