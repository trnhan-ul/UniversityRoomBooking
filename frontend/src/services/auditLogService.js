import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to header if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Get audit logs with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.action - Filter by action type
 * @param {string} params.target_type - Filter by target type
 * @param {string} params.user_id - Filter by user ID
 * @param {string} params.start_date - Start date for filtering
 * @param {string} params.end_date - End date for filtering
 * @param {string} params.search - Search in description
 */
export const getAuditLogs = async (params = {}) => {
  try {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};

/**
 * Get audit log statistics
 * @param {Object} params - Query parameters
 * @param {string} params.start_date - Start date for filtering
 * @param {string} params.end_date - End date for filtering
 */
export const getAuditLogStats = async (params = {}) => {
  try {
    const response = await api.get('/audit-logs/stats', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};

/**
 * Get single audit log by ID
 * @param {string} id - Audit log ID
 */
export const getAuditLogById = async (id) => {
  try {
    const response = await api.get(`/audit-logs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Network error' };
  }
};

const auditLogService = {
  getAuditLogs,
  getAuditLogStats,
  getAuditLogById,
};

export default auditLogService;
