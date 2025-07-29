import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../hooks/useAuth';
import { useAuth } from '../../hooks/useAuth';

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (e.g., from token in memory)
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Replace this with your actual auth check logic
      // For example, validate JWT token or check session
      const token = getStoredToken(); // You'll implement this
      
      if (token) {
        // Validate token with your backend
        const userData = await validateToken(token);
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Replace with your login API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        storeToken(data.token); // Store token in memory or secure storage
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    removeStoredToken(); // Clear stored token
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
export const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page
    window.location.href = redirectTo;
    return null;
  }

  return children;
};

// Higher-order component version (alternative approach)
export const withAuth = (Component, redirectTo = '/login') => {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Token management functions (implement based on your needs)
const getStoredToken = () => {
  // Since we can't use localStorage in artifacts, store in memory
  // In your real app, you might use localStorage, sessionStorage, or cookies
  return window.authToken || null;
};

const storeToken = (token) => {
  // Store in memory for this example
  window.authToken = token;
};

const removeStoredToken = () => {
  delete window.authToken;
};

const validateToken = async (token) => {
  // Replace with your token validation logic
  const response = await fetch('/api/validate-token', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Invalid token');
};