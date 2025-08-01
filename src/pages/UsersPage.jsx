import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from "../services/supabase";
import UserForm from '../components/users/UserForm';
import RoleAssignment from '../components/users/RoleAssignment';
import PermissionEditor from '../components/users/PermissionEditor';

const UsersPage = () => {
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    if (!hasPermission('manage_users')) return;
    
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, [user]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (!error) setUsers(data);
  };

  const fetchRoles = async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('*');
    if (!error) setRoles(data);
  };

  const fetchPermissions = async () => {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('group_id', { ascending: true });
    if (!error) setPermissions(data);
  };

  const handleRoleAssignment = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handlePermissionEdit = (user) => {
    setSelectedUser(user);
    setShowPermissionModal(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      
      <UserForm onUserCreated={fetchUsers} />
      
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Roles</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((usr) => (
              <tr key={usr.id}>
                <td className="py-2 px-4 border-b">{usr.full_name}</td>
                <td className="py-2 px-4 border-b">{usr.email}</td>
                <td className="py-2 px-4 border-b">
                  {/* Display user roles here */}
                </td>
                <td className="py-2 px-4 border-b flex space-x-2">
                  <button 
                    onClick={() => handleRoleAssignment(usr)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Assign Roles
                  </button>
                  <button 
                    onClick={() => handlePermissionEdit(usr)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Edit Permissions
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRoleModal && selectedUser && (
        <RoleAssignment 
          user={selectedUser} 
          roles={roles} 
          onClose={() => setShowRoleModal(false)} 
          onUpdate={fetchUsers}
        />
      )}

      {showPermissionModal && selectedUser && (
        <PermissionEditor 
          user={selectedUser} 
          permissions={permissions} 
          onClose={() => setShowPermissionModal(false)}
        />
      )}
    </div>
  );
};

export default UsersPage;