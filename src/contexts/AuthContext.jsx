import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Mock user for development - start logged in
  const [user, setUser] = useState({ 
    id: 1, 
    username: 'dev_user', 
    email: 'dev@example.com' 
  });
  const [isLoading, setIsLoading] = useState(false); // Set to false for immediate access
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mock token for development
    if (!localStorage.getItem('token')) {
      const mockUser = { 
        id: 1, 
        username: 'dev_user', 
        email: 'dev@example.com' 
      };
      localStorage.setItem('token', 'mock_token_for_development');
      localStorage.setItem('user', JSON.stringify(mockUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      setIsLoading(true);
      
      console.log('Attempting login with:', credentials); // Debug log
      const response = await apiService.login(credentials);
      
      console.log('Login response:', response); // Debug log
      
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      console.log('Attempting register with:', userData); // Debug log
      const response = await apiService.register(userData);
      
      console.log('Register response:', response); // Debug log
      
      return { success: true, message: response.message };
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    error,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
