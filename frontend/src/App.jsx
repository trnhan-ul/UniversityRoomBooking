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
