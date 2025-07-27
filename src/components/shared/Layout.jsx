import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

export const Layout = () => {
  const { loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={profile?.user_roles?.[0]?.roles?.name} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar profile={profile} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        <footer className="bg-white border-t p-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} School ERP System. All rights reserved.
        </footer>
      </div>
    </div>
  );
};