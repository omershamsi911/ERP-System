import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const PermissionEditor = ({ user, permissions, onClose }) => {
  const [userPermissions, setUserPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [permissionGroups, setPermissionGroups] = useState({});

  useEffect(() => {
    const fetchPermissions = async () => {
      // Get direct role permissions
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id);
      
      const roleIds = rolesData.map(r => r.role_id);
      
      const { data: permissionsData } = await supabase
        .from('role_permissions')
        .select('permission_id, role_id, is_granted')
        .in('role_id', roleIds);
      
      const permissionsMap = {};
      permissionsData.forEach(p => {
        permissionsMap[p.permission_id] = p.is_granted;
      });
      setRolePermissions(permissionsMap);
      
      // Group permissions
      const groups = {};
      permissions.forEach(perm => {
        if (!groups[perm.group_id]) {
          groups[perm.group_id] = {
            name: perm.group_id, // Should fetch group name in real app
            permissions: []
          };
        }
        groups[perm.group_id].permissions.push(perm);
      });
      setPermissionGroups(groups);
    };

    fetchPermissions();
  }, [user, permissions]);

  const togglePermission = async (permissionId) => {
    const isGranted = !rolePermissions[permissionId];
    
    // Update in database (simplified - should update all roles)
    // In real implementation, you'd need to update specific role_permissions records
    
    setRolePermissions(prev => ({
      ...prev,
      [permissionId]: isGranted
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          Edit Permissions for {user.full_name}
        </h2>
        
        {Object.entries(permissionGroups).map(([groupId, group]) => (
          <div key={groupId} className="mb-6">
            <h3 className="font-semibold mb-2">{group.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.permissions.map(perm => (
                <div key={perm.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`perm-${perm.id}`}
                    checked={rolePermissions[perm.id] || false}
                    onChange={() => togglePermission(perm.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`perm-${perm.id}`}>
                    {perm.name}
                    <p className="text-xs text-gray-500">{perm.description}</p>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionEditor;