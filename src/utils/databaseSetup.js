import { supabase } from '../services/supabase';

// Default roles for the system
const DEFAULT_ROLES = [
  { name: 'Principal', is_custom: false },
  { name: 'Accountant', is_custom: false },
  { name: 'Super Admin', is_custom: false },
  { name: 'Teacher', is_custom: false },
  { name: 'Receptionist', is_custom: false }
];

export const setupDatabase = async () => {
  try {
    console.log('Setting up database...');

    // Insert default roles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .upsert(DEFAULT_ROLES, { onConflict: 'name' })
      .select();

    if (rolesError) {
      console.error('Error setting up roles:', rolesError);
      return false;
    }

    console.log('✅ Database setup completed successfully!');
    console.log('Available roles:', roles.map(r => r.name));
    return true;

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
};

export const checkDatabaseSetup = async () => {
  try {
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error checking database setup:', error);
      return false;
    }

    console.log('Current roles in database:', roles.map(r => r.name));
    return roles.length > 0;

  } catch (error) {
    console.error('Error checking database setup:', error);
    return false;
  }
}; 