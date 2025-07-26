'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Verify token is still valid by fetching profile
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.data.user);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);

      if (response.data.success) {
        const { user: userData, tokens } = response.data.data;

        localStorage.setItem('token', tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        return userData;
      } else {
        console.error(response);
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);

      if (response.data.success) {
        const { user: newUser, tokens } = response.data.data;

        localStorage.setItem('token', tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);

        return newUser;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Registration failed';

      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        throw new Error(validationErrors.map((err) => err.message).join(', '));
      }

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
