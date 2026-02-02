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

// Get all available rooms
export const getRooms = async (status = "") => {
export const getRooms = async (status = "") => {
  try {
    const url = status ? `/rooms?status=${status}` : "/rooms";
    const response = await api.get(url);
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
    const response = await api.post("/rooms", roomData);
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

// Update room images only
export const updateRoomImages = async (roomId, images) => {
  try {
    const response = await api.put(`/rooms/${roomId}/images`, { images });
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

// Block time slot
export const blockTimeSlot = async (scheduleData) => {
  try {
    const response = await api.post("/rooms/block", scheduleData);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to block time slot",
      }
    );
  }
};

// Unblock time slot
export const unblockTimeSlot = async (scheduleId) => {
  try {
    const response = await api.delete(`/rooms/unblock/${scheduleId}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to unblock time slot",
      }
    );
  }
};
