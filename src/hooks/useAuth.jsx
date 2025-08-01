import { useState, useEffect, useContext, createContext } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (userData) => {
    try {
      const result = await authService.signup(userData);
      
      if (result.success) {
        setUser(result.user);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const hasPermission = (requiredPermission) => {
    if (!requiredPermission) return true;
    if (!user || !user.roles) return false;
    
    // Super Admin has all permissions
    if (user.roles.includes('Super Admin')) return true;
    
    // Map permissions to roles (you can expand this)
    const rolePermissions = {
      'Principal': ['manage_users', 'view_students', 'edit_students', 'manage_fees', 'view_fees', 'manage_attendance', 'view_attendance', 'manage_academic', 'view_reports', 'manage_settings'],
      'Accountant': ['view_students', 'manage_fees', 'view_fees', 'view_reports'],
      'Teacher': ['view_students', 'view_attendance', 'view_reports'],
      'Receptionist': ['view_students', 'edit_students', 'view_fees', 'view_attendance']
    };

    const userPermissions = user.roles.flatMap(role => rolePermissions[role] || []);
    return userPermissions.includes(requiredPermission);
  };

  const hasRole = (requiredRole) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(requiredRole);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    hasPermission,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};