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
    
    // Map permissions to roles
    const rolePermissions = {
      'Principal': [
        'manage_users', 'view_students', 'edit_students', 'manage_fees', 
        'view_fees', 'manage_attendance', 'view_attendance', 'manage_academic', 
        'view_reports', 'manage_settings', 'access_teacher_dashboard',
        'input_marks', 'manage_rechecking', 'manage_student_attendance',
        'view_student_progress', 'manage_own_attendance',
        'manage_student_attendance_page', 'view_student_details'
      ],
      'Accountant': [
        'view_students', 'manage_fees', 'view_fees', 'view_reports'
      ],
      'Class Teacher': [
        'view_students', 'view_attendance', 'view_reports', 
        'access_teacher_dashboard', 'input_marks', 'manage_rechecking',
        'manage_own_attendance', 'manage_student_attendance', 
        'view_student_progress', 'manage_student_attendance_page'
      ],
      'Subject Teacher': [
        'view_students', 'view_attendance', 'view_reports', 
        'access_teacher_dashboard', 'input_marks', 'manage_rechecking',
        'manage_own_attendance'
      ],
      'Receptionist': [
        'view_students', 'edit_students', 'view_fees', 'view_attendance',
        'view_student_details'
      ]
    };

    // Collect permissions from all user roles
    const userPermissions = user.roles.reduce((permissions, role) => {
      return [...permissions, ...(rolePermissions[role] || [])];
    }, []);

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