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

// UC14 - Create booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};

// User bookings (UC19)
export const getMyBookings = async (
  page = 1,
  limit = 20,
  status = null,
  time = null,
) => {
  try {
    let url = `/bookings/my-bookings?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (time) url += `&time=${time}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};

// Pending bookings (Manager/Admin)
export const getPendingBookings = async (page = 1, limit = 50) => {
  try {
    const response = await api.get(
      `/bookings/pending?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};

// Booking detail
export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};

// Approve or reject booking (Manager/Admin)
export const approveBooking = async (bookingId) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};

// Reject booking (Manager/Admin)
export const rejectBooking = async (bookingId, rejectReason) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/reject`, {
      reject_reason: rejectReason,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};

// Cancel booking (User)
export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};

// Update booking (User)
export const updateBooking = async (bookingId, bookingData) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}`, bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};

// Booking statistics (Manager/Admin)
export const getBookingStatistics = async () => {
  try {
    const response = await api.get(`/bookings/statistics`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Network error" };
  }
};
