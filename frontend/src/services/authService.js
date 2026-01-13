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

// Đăng nhập
export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', {
            email,
            password
        });

        // Lưu token vào localStorage
        if (response.data.success && response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Network error' };
    }
};

// Đăng xuất
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Lấy thông tin user hiện tại
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Kiểm tra đã đăng nhập chưa
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export default api;
