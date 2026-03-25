/**
 * API configuration and constants
 */

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      VERIFY_TOKEN: '/auth/verify-token',
      REFRESH_TOKEN: '/auth/refresh-token',
    },
    USER: {
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
    },
    BOOKING: {
      MY_BOOKINGS: '/bookings/my-bookings',
      DETAIL: '/bookings',
    },
  },
  TIMEOUT: 30000, // 30 seconds
};
