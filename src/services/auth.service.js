import { supabase } from './supabase';

// Hardcoded test credentials for development
const TEST_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123',
  full_name: 'Test Admin',
  contact: '+1234567890'
};

// Test user data that bypasses database check
const TEST_USER = {
  id: 1,
  email: TEST_CREDENTIALS.email,
  full_name: TEST_CREDENTIALS.full_name,
  contact: TEST_CREDENTIALS.contact,
  roles: ['Super Admin', 'Subject Teacher', 'Class Teacher']
};

export const authService = {
  // Check if credentials match test user
  isTestUser: (email, password) => {
    return email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password;
  },

  // Login function
  async login(email, password) {
    try {
      // Check if it's the test user first
      if (this.isTestUser(email, password)) {
        // Return test user data
        localStorage.setItem('authToken', 'test-token-12345');
        localStorage.setItem('user', JSON.stringify(TEST_USER));
        return {
          success: true,
          user: TEST_USER,
          message: 'Logged in as test user'
        };
      }

      // For production: check users table
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password) // In production, this should be hashed
        .single();

      if (error || !users) {
        throw new Error('Invalid credentials');
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          roles(name)
        `)
        .eq('user_id', users.id);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      const roles = userRoles?.map(ur => ur.roles.name) || [];

      const userData = {
        ...users,
        roles
      };

      // Store in localStorage
      localStorage.setItem('authToken', `user-token-${users.id}`);
      localStorage.setItem('user', JSON.stringify(userData));

      return {
        success: true,
        user: userData,
        message: 'Logged in successfully'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  },

  // Signup function
  async signup(userData) {
    try {
      const { email, password, full_name, contact, role } = userData;

      // First, check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Insert new user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          email,
          password_hash: password, // In production, this should be hashed
          full_name,
          contact
        }])
        .select()
        .single();

      if (userError) {
        throw new Error('Failed to create user');
      }

      // Get role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();

      if (roleError) {
        throw new Error('Invalid role');
      }

      // Assign role to user
      const { error: userRoleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: newUser.id,
          role_id: roleData.id
        }]);

      if (userRoleError) {
        throw new Error('Failed to assign role');
      }

      return {
        success: true,
        user: newUser,
        message: 'User created successfully'
      };

    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.message || 'Signup failed'
      };
    }
  },

  // Logout function
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return { success: true };
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get available roles
  async getRoles() {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }
};

export { TEST_CREDENTIALS, TEST_USER };
