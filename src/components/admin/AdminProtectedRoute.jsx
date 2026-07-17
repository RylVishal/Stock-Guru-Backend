import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../../services/auth';

// Simple JWT decoder to extract role without verification
const getUserRoleFromToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export default function AdminProtectedRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      setChecking(false);
      return;
    }

    const role = getUserRoleFromToken(accessToken);
    setIsAdmin(role === 'admin');
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-sm">Loading...</div>
      </div>
    );
  }

  // If no token or not admin, redirect to home
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

