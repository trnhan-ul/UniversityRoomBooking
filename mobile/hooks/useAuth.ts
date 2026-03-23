import { useState, useEffect, useCallback } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getStoredUser,
  getStoredToken,
  verifyToken as apiVerifyToken,
} from '../services/authService';
import { validateLoginForm, getErrorMessage } from '../utils/validation';
import { User } from '../context/AuthContext';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await getStoredToken();
        const storedUser = await getStoredUser();

        if (storedToken && storedUser) {
          // Verify token with backend
          try {
            const result = await apiVerifyToken();
            if (result.success && result.data?.user) {
              // Token valid, update user from server
              setToken(storedToken);
              setUser(result.data.user as User);
            } else {
              // Token invalid, clear storage
              await apiLogout();
              setToken(null);
              setUser(null);
            }
          } catch (error) {
            // Token expired or invalid, clear storage
            await apiLogout();
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        // Validate form
        const validationError = validateLoginForm(email, password);
        if (validationError) {
          throw new Error(validationError);
        }

        const result = await apiLogin(email, password);

        if (result.success && result.data) {
          const { token: authToken, user: userData } = result.data;
          setToken(authToken);
          setUser(userData as User);
          return true;
        }

        throw new Error(result.message || 'Login failed');
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiLogout();
      setToken(null);
      setUser(null);
    } catch (error) {
      // Still clear local state even if logout request fails
      setToken(null);
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!token;

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    setUser,
  };
};
