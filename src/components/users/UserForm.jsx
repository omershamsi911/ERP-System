import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { useNotification } from '../../hooks/useNotification';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { authService } from '../../services/auth.service';

const UserForm = ({ onUserCreated, initialUser = null }) => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: '',
    contact: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialUser) {
      setFormData({
        email: initialUser.email || '',
        password: '',
        confirmPassword: '',
        full_name: initialUser.full_name || '',
        role: initialUser.role || '',
        contact: initialUser.contact || ''
      });
    }
    loadRoles();
  }, [initialUser]);

  const loadRoles = async () => {
    try {
      const availableRoles = await authService.getRoles();
      setRoles(availableRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
      showError('Failed to load roles');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!initialUser) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (initialUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            email: formData.email,
            full_name: formData.full_name,
            contact: formData.contact,
            role: formData.role
          })
          .eq('id', initialUser.id);

        if (error) throw error;
        showSuccess('User updated successfully');
      } else {
        // Create new user
        const userData = {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          contact: formData.contact,
          role: formData.role
        };

        await authService.signup(userData);
        showSuccess('User created successfully');
      }

      if (onUserCreated) onUserCreated();
    } catch (error) {
      console.error('Error saving user:', error);
      showError(error.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {initialUser ? 'Edit User' : 'Create New User'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {!initialUser && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                {initialUser ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              initialUser ? 'Update User' : 'Create User'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;