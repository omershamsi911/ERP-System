// contexts/AuthContext.jsx
import React, { useState, useEffect } from 'react';
import { AuthContext } from '../hooks/useAuth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

   const signIn = async (email, password, isMockMode = false) => {
    try {
      // Hardcoded admin credentials
      const ADMIN_EMAIL = 'admin@admin.com';
      const ADMIN_PASSWORD = 'admin123';
      
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Mock admin login
        const mockAdminUser = {
          id: 1,
          email: ADMIN_EMAIL,
          name: 'Admin User',
          role: 'admin',
          permissions: ['read', 'write', 'delete']
        };
        
        // Store in localStorage
        localStorage.setItem('authToken', 'mock-admin-token-12345');
        localStorage.setItem('user', JSON.stringify(mockAdminUser));
        
        setUser(mockAdminUser);
        
        return {
          success: true,
          user: mockAdminUser,
          token: 'mock-admin-token-12345'
        };
      }
      
      // For real authentication (when you connect to your backend)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        return {
          success: true,
          user: data.user,
          token: data.token
        };
      } else {
        return {
          success: false,
          error: data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      
      // Replace with your actual signup API endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Optionally auto-login after signup
        setUser(data.user);
        storeToken(data.token);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    signIn,
    signup,
    signOut,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Token management functions
const getStoredToken = () => {
  // In a real app, use localStorage or secure HTTP-only cookies
  try {
    return localStorage.getItem('authToken');
  } catch {
    return null;
  }
};

const storeToken = (token) => {
  try {
    localStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

const removeStoredToken = () => {
  try {
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

const validateToken = async (token) => {
  // Replace with your token validation endpoint
  const response = await fetch('/api/auth/validate', {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    return await response.json();
  }
  
  throw new Error('Invalid token');
};