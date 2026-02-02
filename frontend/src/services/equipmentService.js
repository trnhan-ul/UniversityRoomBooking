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

// Get all equipment with optional filters
export const getAllEquipment = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.room_id) params.append("room_id", filters.room_id);
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const response = await api.get(`/equipment?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching equipment:", error);
    throw error;
  }
};

// Get equipment by room ID
export const getEquipmentByRoom = async (roomId) => {
  try {
    const response = await api.get(`/equipment/room/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching equipment by room:", error);
    throw error;
  }
};

// Get single equipment by ID
export const getEquipmentById = async (id) => {
  try {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching equipment:", error);
    throw error;
  }
};

// Create new equipment
export const createEquipment = async (equipmentData) => {
  try {
    const response = await api.post("/equipment", equipmentData);
    return response.data;
  } catch (error) {
    console.error("Error creating equipment:", error);
    throw error;
  }
};

// Update equipment
export const updateEquipment = async (id, equipmentData) => {
  try {
    const response = await api.patch(`/equipment/${id}`, equipmentData);
    return response.data;
  } catch (error) {
    console.error("Error updating equipment:", error);
    throw error;
  }
};

// Delete equipment
export const deleteEquipment = async (id) => {
  try {
    const response = await api.delete(`/equipment/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting equipment:", error);
    throw error;
  }
};
