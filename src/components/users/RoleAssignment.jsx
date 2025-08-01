import React, { useState, useEffect } from 'react';
import { supabase } from "../../services/supabase";

const RoleAssignment = ({ user, roles, onClose, onUpdate }) => {
  const [userRoles, setUserRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    const fetchUserRoles = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id);
      
      setUserRoles(data.map(ur => ur.role_id));
    };

    setAvailableRoles(roles.map(r => r.id));
    fetchUserRoles();
  }, [user, roles]);

  const toggleRole = async (roleId) => {
    const hasRole = userRoles.includes(roleId);
    
    if (hasRole) {
      await supabase
        .from('user_roles')
        .delete()
        .match({ user_id: user.id, role_id: roleId });
    } else {
      await supabase
        .from('user_roles')
        .insert([{ user_id: user.id, role_id: roleId }]);
    }

    setUserRoles(prev => 
      hasRole 
        ? prev.filter(id => id !== roleId) 
        : [...prev, roleId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          Assign Roles to {user.full_name}
        </h2>
        
        <div className="space-y-2">
          {roles.map(role => (
            <div key={role.id} className="flex items-center">
              <input
                type="checkbox"
                id={`role-${role.id}`}
                checked={userRoles.includes(role.id)}
                onChange={() => toggleRole(role.id)}
                className="mr-2"
              />
              <label htmlFor={`role-${role.id}`}>
                {role.name} {role.is_custom && '(Custom)'}
              </label>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdate();
              onClose();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignment;