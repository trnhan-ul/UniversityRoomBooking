import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';
import { CustomApiError } from '../utils/errorHandler';
import { getErrorMessage } from '../utils/validation';

// Create axios instance
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add token to headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      _id: string;
      email: string;
      full_name: string;
      role: string;
      status: string;
      phone_number?: string;
      avatar?: string;
      email_verified: boolean;
    };
  };
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  data?: {
    email: string;
    full_name: string;
  };
  message?: string;
}

// Login
export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        email,
        password,
      },
    );

    if (response.data.success && response.data.data) {
      const { token, user } = response.data.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<LoginResponse>;
    const errorData = axiosError.response?.data;
    const errorMessage = errorData
      ? getErrorMessage(errorData)
      : getErrorMessage(error);

    throw new CustomApiError(errorMessage, errorData);
  }
};

// Register
export const register = async (
  email: string,
  password: string,
  fullName: string,
): Promise<RegisterResponse> => {
  try {
    const response = await api.post<RegisterResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      {
        email,
        password,
        full_name: fullName,
      },
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<RegisterResponse>;
    const errorData = axiosError.response?.data;
    const errorMessage = errorData
      ? getErrorMessage(errorData)
      : getErrorMessage(error);

    throw new CustomApiError(errorMessage, errorData);
  }
};

// Logout
export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
};

// Verify token
export const verifyToken = async () => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.VERIFY_TOKEN);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get stored user
export const getStoredUser = async () => {
  try {
    const userStr = await AsyncStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// Get stored token
export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch {
    return null;
  }
};
