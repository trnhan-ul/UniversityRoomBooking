import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Create a new facility issue report
export const createFacilityIssue = async (issueData) => {
  try {
    const response = await api.post('/facility-issues', issueData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};

// Get all facility issues (Admin only)
export const getAllFacilityIssues = async (filters = {}) => {
  try {
    const { status, severity, issue_type, room_id, page = 1, limit = 20, sort = '-created_at' } = filters;
    let url = `/facility-issues?page=${page}&limit=${limit}&sort=${sort}`;
    if (status) url += `&status=${status}`;
    if (severity) url += `&severity=${severity}`;
    if (issue_type) url += `&issue_type=${issue_type}`;
    if (room_id) url += `&room_id=${room_id}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};

// Get current user's facility issues
export const getMyFacilityIssues = async (status = null, page = 1, limit = 20) => {
  try {
    let url = `/facility-issues/my-issues?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};

// Get a specific facility issue by ID
export const getFacilityIssueById = async (id) => {
  try {
    const response = await api.get(`/facility-issues/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};

// Update facility issue status (Admin only)
export const updateFacilityIssueStatus = async (id, statusData) => {
  try {
    const response = await api.put(`/facility-issues/${id}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};

// Delete a facility issue (Admin only)
export const deleteFacilityIssue = async (id) => {
  try {
    const response = await api.delete(`/facility-issues/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};

// Get facility issue statistics (Admin only)
export const getFacilityIssueStats = async () => {
  try {
    const response = await api.get('/facility-issues/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};
