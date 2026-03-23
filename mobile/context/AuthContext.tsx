import React, { createContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

export interface User {
  _id: string;
  email: string;
  full_name: string;
  role: 'STUDENT' | 'LECTURER' | 'FACILITY_MANAGER' | 'ADMINISTRATOR';
  status: string;
  phone_number?: string;
  avatar?: string;
  email_verified: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
