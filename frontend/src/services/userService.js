import axios from 'axios';
import api from './authService';

const API_URL = 'http://localhost:5000/api/users';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ========== PROFILE MANAGEMENT ==========

// Get current user profile
export const getMyProfile = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};

// Update user profile
export const updateMyProfile = async (profileData) => {
  try {
    const response = await api.put('/users/me', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/users/me/password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};

// ========== USER MANAGEMENT (ADMIN) ==========

// UC41: Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error.response?.data || error;
  }
};

// UC42: Create new user
export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Create user error:', error);
    throw error.response?.data || error;
  }
};

// Get all users with filters
export const getAllUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await axios.get(`${API_URL}?${params.toString()}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Get all users error:', error);
    throw error.response?.data || error;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.patch(`${API_URL}/${userId}`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Update user error:', error);
    throw error.response?.data || error;
  }
};

// Delete user (soft delete)
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/${userId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error.response?.data || error;
  }
};

// Admin reset password for a user + send email
export const adminResetUserPassword = async (userId, passwordData) => {
  try {
    const response = await axios.patch(`${API_URL}/${userId}/reset-password`, passwordData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Admin reset password error:', error);
    throw error.response?.data || error;
  }
};
