import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

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