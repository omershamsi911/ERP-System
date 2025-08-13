import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const AccessDenied = ({ requiredPermission }) => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-2xl mx-auto">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-lg">
            You don't have permission to access this page.
          </p>
        </div>
        
        <div className="space-y-4 text-left">
          <p>
            <span className="font-semibold">Required Permission:</span> 
            <span className="ml-2 px-2 py-1 bg-gray-200 rounded-md">{requiredPermission}</span>
          </p>
          
          {user && (
            <p>
              <span className="font-semibold">Your Roles:</span> 
              <span className="ml-2">
                {user.roles?.join(', ') || 'No roles assigned'}
              </span>
            </p>
          )}
          
          <p className="text-gray-600 mt-4">
            Please contact your administrator if you believe this is an error or 
            if you need access to this resource.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;