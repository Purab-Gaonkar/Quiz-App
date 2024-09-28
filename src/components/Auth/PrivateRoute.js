import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, adminOnly = false }) {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/user" />;
  }

  return children;
}

export default PrivateRoute;
