// contexts/AuthContext.jsx
import React, { useState, useEffect } from 'react';
import { AuthContext } from '../hooks/useAuth';

// Token management functions
const getStoredToken = () => {
  // In a real app, use localStorage or secure HTTP-only cookies
  try {
    return localStorage.getItem('authToken');
  } catch {
    return null;
  }
};

const storeToken = (token) => {
  try {
    localStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

const removeStoredToken = () => {
  try {
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

const validateToken = async (token) => {
  // Replace with your token validation endpoint
  const response = await fetch('/api/auth/validate', {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    return await response.json();
  }
  
  throw new Error('Invalid token');
};