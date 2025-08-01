import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { useNotification } from '../../hooks/useNotification';
import { LoadingSpinner } from '../shared/LoadingSpinner';

const UserForm = ({ onUserCreated, initialUser = null }) => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role_id: '',
    contact: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialUser) {
      setFormData({
        email: initialUser.email || '',
        password: '',
        full_name: initialUser.full_name || '',
        role_id: initialUser.role_id || '',
        contact: initialUser.contact || ''
      });
    }
    fetchRoles();
  }, [initialUser]);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
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

    if (!initialUser && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'Role is required';
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
      let result;
      
      if (initialUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('users')
          .update({
            email: formData.email,
            full_name: formData.full_name,
            contact: formData.contact
          })
          .eq('id', initialUser.id);

        if (error) throw error;

        // Update role if changed
        if (formData.role_id !== initialUser.role_id) {
          await updateUserRole(initialUser.id, formData.role_id);
        }

        result = data;
        showSuccess('User updated successfully');
      } else {
        // Create new user
        const { user, error } = await supabase.auth.signUp(
          { 
            email: formData.email,
            password: formData.password 
          },
          { 
            data: {
              full_name: formData.full_name,
              contact: formData.contact,
              created_by: currentUser.id
            } 
          }
        );

        if (error) throw error;

        // Assign role
        await supabase
          .from('user_roles')
          .insert([{ 
            user_id: user.id, 
            role_id: formData.role_id,
            assigned_by: currentUser.id 
          }]);

        result = user;
        showSuccess('User created successfully');
      }

      if (onUserCreated) onUserCreated(result);
    } catch (error) {
      console.error('Error saving user:', error);
      showError(error.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, roleId) => {
    // First remove all existing roles
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    // Then add the new role
    await supabase
      .from('user_roles')
      .insert([{ 
        user_id: userId, 
        role_id: roleId,
        assigned_by: currentUser.id 
      }]);
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
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.role_id ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role_id && (
              <p className="text-red-500 text-xs mt-1">{errors.role_id}</p>
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