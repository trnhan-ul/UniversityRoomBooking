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

// Get calendar data
export const getCalendarData = async (startDate, endDate, roomId = null, bookingStatus = 'ALL') => {
    try {
        const params = {
            start_date: startDate,
            end_date: endDate,
        };
        if (roomId) {
            params.room_id = roomId;
        }
        if (bookingStatus && bookingStatus !== 'ALL') {
            params.booking_status = bookingStatus;
        }
        const response = await api.get("/schedules/calendar", { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: "Network error" };
    }
};
