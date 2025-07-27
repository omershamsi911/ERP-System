import { useState, useEffect, useCallback } from 'react';
import { usersService } from '../services/users.service';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getUsers(filters);
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const getUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getUser(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch user');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.createUser(userData);
      setUsers(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to create user');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.updateUser(id, updates);
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...data } : user
      ));
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to update user');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await usersService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getUserRoles();
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch user roles');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getUserRoles
  };
};