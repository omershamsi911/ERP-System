import { supabase } from './supabase';

export const usersService = {
  async getUsers(filters = {}) {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            roles (
              name,
              permissions
            )
          )
        `);

      // Apply filters
      if (filters.role) {
        query = query.eq('user_roles.roles.name', filters.role);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch users');
    }
  },

  async getUser(id) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            roles (
              name,
              permissions
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch user');
    }
  },

  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to create user');
    }
  },

  async updateUser(id, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to update user');
    }
  },

  async deleteUser(id) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error('Failed to delete user');
    }
  },

  async getUserRoles() {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch user roles');
    }
  },

  async assignRole(userId, roleId) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role_id: roleId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to assign role');
    }
  },

  async removeRole(userId, roleId) {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error('Failed to remove role');
    }
  },

  async getUserStats() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, status, created_at');

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(user => user.status === 'active').length,
        inactive: data.filter(user => user.status === 'inactive').length,
        thisMonth: data.filter(user => {
          const userDate = new Date(user.created_at);
          const now = new Date();
          return userDate.getMonth() === now.getMonth() && 
                 userDate.getFullYear() === now.getFullYear();
        }).length
      };

      return stats;
    } catch (error) {
      throw new Error('Failed to fetch user statistics');
    }
  }
};