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
  (error) => Promise.reject(error)
);

// Get all available rooms
export const getRooms = async (status = "AVAILABLE") => {
  try {
    const response = await api.get(`/rooms?status=${status}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};

// Get room by ID
export const getRoomById = async (roomId) => {
  try {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};

// Create new room
export const createRoom = async (roomData) => {
  try {
    const response = await api.post('/rooms', roomData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};

// Update room
export const updateRoom = async (roomId, roomData) => {
  try {
    const response = await api.put(`/rooms/${roomId}`, roomData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};

// Delete room
export const deleteRoom = async (roomId) => {
  try {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};
