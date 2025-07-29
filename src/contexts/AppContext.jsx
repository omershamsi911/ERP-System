import React, { useState } from 'react';
import { AppContext } from '../hooks/useApp';

export const AppProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState('light');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = { id, ...notification, timestamp: new Date() };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const value = {
    sidebarCollapsed,
    toggleSidebar,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    theme,
    toggleTheme
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};