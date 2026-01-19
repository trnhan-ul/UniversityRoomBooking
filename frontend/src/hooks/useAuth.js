import { useState, useEffect } from 'react';
import { login as apiLogin, verifyToken as apiVerifyToken } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Verify token với backend
          const result = await apiVerifyToken();

          if (result.success && result.data.user) {
            // Token hợp lệ, cập nhật user từ server (tránh data cũ)
            setToken(storedToken);
            setUser(result.data.user);
            // Cập nhật localStorage với data mới nhất
            localStorage.setItem('user', JSON.stringify(result.data.user));
          } else {
            // Token không hợp lệ, xóa localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Token expired hoặc invalid, xóa localStorage
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await apiLogin(email, password);

      if (result.success && result.data) {
        const { token: authToken, user: userData } = result.data;
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout
  };
};
