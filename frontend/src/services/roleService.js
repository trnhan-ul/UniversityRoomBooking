import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// UC40: Get all roles
export const getAllRoles = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);

    const response = await axios.get(`${API_URL}/roles?${params.toString()}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Get all roles error:', error);
    throw error.response?.data || error;
  }
};

// UC40: Get role by ID
export const getRoleById = async (roleId) => {
  try {
    const response = await axios.get(`${API_URL}/roles/${roleId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Get role by ID error:', error);
    throw error.response?.data || error;
  }
};

// UC40: Create new role
export const createRole = async (roleData) => {
  try {
    const response = await axios.post(`${API_URL}/roles`, roleData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Create role error:', error);
    throw error.response?.data || error;
  }
};

// UC40: Update role
export const updateRole = async (roleId, roleData) => {
  try {
    const response = await axios.patch(`${API_URL}/roles/${roleId}`, roleData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Update role error:', error);
    throw error.response?.data || error;
  }
};

// UC40: Delete role
export const deleteRole = async (roleId) => {
  try {
    const response = await axios.delete(`${API_URL}/roles/${roleId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Delete role error:', error);
    throw error.response?.data || error;
  }
};

// UC41: Assign permissions to role
export const assignPermissions = async (roleId, permissions) => {
  try {
    const response = await axios.patch(
      `${API_URL}/roles/${roleId}/permissions`,
      { permissions },
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Assign permissions error:', error);
    throw error.response?.data || error;
  }
};

// Get available permissions
export const getAvailablePermissions = async () => {
  try {
    const response = await axios.get(`${API_URL}/roles/permissions/available`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Get available permissions error:', error);
    throw error.response?.data || error;
  }
};
