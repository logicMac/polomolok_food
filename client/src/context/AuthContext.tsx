import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; otpSent?: boolean }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, recaptchaToken: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string, recaptchaToken: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, recaptchaToken });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return { 
        success: true, 
        message: response.data.message,
        otpSent: response.data.data.otpSent 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const { user: userData } = response.data.data;
      
      // Only store user data, tokens are in httpOnly cookies
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'OTP verification failed' 
      };
    }
  };

  const logout = () => {
    // Call logout endpoint to clear cookies
    api.post('/auth/logout').catch(console.error);
    
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyOTP,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
