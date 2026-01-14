import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
