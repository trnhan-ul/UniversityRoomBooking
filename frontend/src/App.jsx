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
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes - Student */}
      <Route 
        path="/student/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected Routes - Lecturer */}
      <Route 
        path="/lecturer/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['LECTURER']}>
            <LecturerDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected Routes - Facility Manager */}
      <Route 
        path="/facility-manager/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['FACILITY_MANAGER']}>
            <FacilityManagerDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected Routes - Administrator */}
      <Route 
        path="/administrator/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
            <AdministratorDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
