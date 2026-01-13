import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tạo axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Thêm token vào header nếu có
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

// Lấy danh sách booking của user hiện tại (UC19)
export const getMyBookings = async (page = 1, limit = 20, status = null, time = null) => {
    try {
        let url = `/bookings/my-bookings?page=${page}&limit=${limit}`;
        if (status) {
            url += `&status=${status}`;
        }
        if (time) {
            url += `&time=${time}`;
        }
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Network error' };
    }
};

// Lấy danh sách booking pending (Manager/Admin)
export const getPendingBookings = async (page = 1, limit = 50) => {
    try {
        const response = await api.get(`/bookings/pending?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Network error' };
    }
};

// Lấy chi tiết booking
export const getBookingById = async (bookingId) => {
    try {
        const response = await api.get(`/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Network error' };
    }
};

// Approve hoặc reject booking (Manager/Admin)
export const approveBooking = async (bookingId, action, rejectReason = null) => {
    try {
        const payload = { action };
        if (rejectReason) {
            payload.reject_reason = rejectReason;
        }
        const response = await api.patch(`/bookings/${bookingId}/approve`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Network error' };
    }
};

// Cancel booking (User)
export const cancelBooking = async (bookingId) => {
    try {
        const response = await api.patch(`/bookings/${bookingId}/cancel`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Network error' };
    }
};
