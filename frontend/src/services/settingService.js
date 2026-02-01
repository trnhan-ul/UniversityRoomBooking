import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Get working hours (public endpoint)
export const getWorkingHours = async () => {
  try {
    const response = await api.get("/settings/working-hours");
    return response.data;
  } catch (error) {
    console.error("Get working hours error:", error);
    throw error.response?.data || error;
  }
};

// Update working hours (Admin/Facility Manager only)
export const updateWorkingHours = async (workingHours) => {
  try {
    const response = await api.put("/settings/working-hours", workingHours);
    return response.data;
  } catch (error) {
    console.error("Update working hours error:", error);
    throw error.response?.data || error;
  }
};

// Get all settings (Admin/Facility Manager only)
export const getAllSettings = async () => {
  try {
    const response = await api.get("/settings");
    return response.data;
  } catch (error) {
    console.error("Get all settings error:", error);
    throw error.response?.data || error;
  }
};

// Get setting by key (Admin/Facility Manager only)
export const getSettingByKey = async (key) => {
  try {
    const response = await api.get(`/settings/${key}`);
    return response.data;
  } catch (error) {
    console.error("Get setting by key error:", error);
    throw error.response?.data || error;
  }
};

// Update setting by key (Admin/Facility Manager only)
export const updateSetting = async (key, settingData) => {
  try {
    const response = await api.put(`/settings/${key}`, settingData);
    return response.data;
  } catch (error) {
    console.error("Update setting error:", error);
    throw error.response?.data || error;
  }
};
