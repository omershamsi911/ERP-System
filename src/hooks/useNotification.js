import { useState, useCallback } from 'react';
import { useApp } from './useApp.js';

export const useNotification = () => {
  const { addNotification, removeNotification, clearNotifications, notifications } = useApp();
  const [loading, setLoading] = useState(false);

  const showSuccess = useCallback((message, title = 'Success') => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: 5000
    });
  }, [addNotification]);

  const showError = useCallback((message, title = 'Error') => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 7000
    });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Warning') => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000
    });
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Information') => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: 5000
    });
  }, [addNotification]);

  const showLoading = useCallback((message = 'Loading...') => {
    setLoading(true);
    addNotification({
      type: 'loading',
      title: 'Loading',
      message,
      duration: null // No auto-dismiss
    });
  }, [addNotification]);

  const hideLoading = useCallback(() => {
    setLoading(false);
    // Remove loading notification
    const loadingNotification = notifications.find(n => n.type === 'loading');
    if (loadingNotification) {
      removeNotification(loadingNotification.id);
    }
  }, [notifications, removeNotification]);

  return {
    notifications,
    loading,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    hideLoading,
    removeNotification,
    clearNotifications
  };
};