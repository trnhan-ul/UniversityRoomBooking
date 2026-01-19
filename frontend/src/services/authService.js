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

// Đăng ký tài khoản mới
export const register = async (email, password, full_name, phone_number) => {
    try {
        const response = await api.post('/auth/register', {
            email,
            password,
            full_name,
            phone_number
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Network error' };
    }
};

// Xác thực email
export const verifyEmail = async (token) => {
    try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Network error' };
    }
};

// Kiểm tra token còn hợp lệ không
export const verifyToken = async () => {
    try {
        const response = await api.get('/auth/verify-token');
        return response.data;
    } catch (error) {
        // Nếu token invalid/expired, xóa localStorage
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        throw error.response?.data || { success: false, message: 'Network error' };
    }
};

// Gửi lại email xác thực
export const resendVerificationEmail = async (email) => {
    try {
        const response = await api.post('/auth/resend-verification', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Network error' };
    }
};

// Forgot Password - Request reset code
export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Network error' };
    }
};

// Reset Password - Verify code and reset password
export const resetPassword = async (email, code, newPassword) => {
    try {
        const response = await api.post('/auth/reset-password', {
            email,
            code,
            newPassword
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Network error' };
    }
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
