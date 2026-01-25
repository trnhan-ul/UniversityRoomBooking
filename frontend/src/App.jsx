import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from "./context/AuthContext";
import { AdminLayout } from "./components/layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerification from "./pages/EmailVerification";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import PendingRequests from "./pages/PendingRequests";
import MyBookings from "./pages/MyBookings";
import HomePage from "./pages/HomePage";
import MyProfile from "./pages/MyProfile";
import CreateBooking from "./pages/CreateBooking";
import BookingDetail from "./pages/BookingDetail";
import SearchClassrooms from "./pages/SearchClassrooms";
import ClassroomDetails from "./pages/ClassroomDetails";
import ClassroomScheduleGrid from "./pages/ClassroomScheduleGrid";
import RoomInventory from "./pages/RoomInventory";
import CreateClassroom from "./pages/CreateClassroom";

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
        <Route
          path="/register"
          element={
            !user ? (
              <Register />
            ) : (
              <Navigate to={getDefaultPath(user.role)} replace />
            )
          }
        />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        {user && isAdminRole(user.role) && (
          <Route
            path="/admin/dashboard"
            element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            }
          />
        )}

        {user && user.role === "ADMINISTRATOR" && (
          <Route
            path="/user-management"
            element={
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            }
          />
        )}

        {user && isAdminRole(user.role) && (
          <Route
            path="/room-inventory"
            element={
              <AdminLayout>
                <RoomInventory />
              </AdminLayout>
            }
          />
        )}

        {user && isAdminRole(user.role) && (
          <Route
            path="/create-classroom"
            element={
              <AdminLayout>
                <CreateClassroom />
              </AdminLayout>
            }
          />
        )}

        {user &&
          (user.role === "FACILITY_MANAGER" ||
            user.role === "ADMINISTRATOR") && (
            <Route
              path="/pending-requests"
              element={
                <AdminLayout>
                  <PendingRequests />
                </AdminLayout>
              }
            />
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
            <Route path="/booking-detail/:id" element={<BookingDetail />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/create-booking" element={<CreateBooking />} />
            <Route path="/search-classrooms" element={<SearchClassrooms />} />
            <Route path="/classroom-details" element={<ClassroomDetails />} />
            <Route path="/schedule-grid" element={<ClassroomScheduleGrid />} />
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
