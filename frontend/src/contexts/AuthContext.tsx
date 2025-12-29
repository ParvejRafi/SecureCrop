import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import type { User, RegisterData } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, returnTo?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');

      if (storedUser && token) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, returnTo?: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      // Store tokens and user data
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);

      // Navigate based on returnTo or role
      if (returnTo) {
        navigate(returnTo);
      } else if (response.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authAPI.register(data);
      // Registration successful - redirect to login page
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.email?.[0] 
        || error.response?.data?.username?.[0]
        || error.response?.data?.password?.[0]
        || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
