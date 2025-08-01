// Authentication Setup Utility
// This file helps set up authentication for development

import { supabase } from '../services/supabase';

export const setupTestUser = async () => {
  try {
    // Check if test user exists
    const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'admin123'
    });

    if (checkError && checkError.message.includes('Invalid login credentials')) {
      // Create test user
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@test.com',
        password: 'admin123',
        options: {
          data: {
            full_name: 'Admin User',
            role: 'admin'
          }
        }
      });

      if (error) {
        console.error('Error creating test user:', error);
        return false;
      }

      console.log('Test user created successfully!');
      console.log('Email: admin@test.com');
      console.log('Password: admin123');
      return true;
    }

    return true;
  } catch (error) {
    console.error('Setup error:', error);
    return false;
  }
};

export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

// Test credentials for development
export const TEST_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123'
}; 