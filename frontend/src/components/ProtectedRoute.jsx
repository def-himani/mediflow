import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ role, children }) {
  const location = useLocation();

  // Public routes for both patient and physician
  const publicPaths = [
    '/patient/login',
    '/patient/signup',
    '/physician/login',
    '/physician/signup'
  ];

  // If user is on a public page → allow regardless of token
  if (publicPaths.includes(location.pathname)) {
    return children;
  }

  const patientToken = localStorage.getItem('token');
  const physicianToken = localStorage.getItem('physicianToken');

  // Determine authorization based on role
  let isAuthorized = false;
  if (role === 'patient') {
    isAuthorized = !!patientToken;
  } else if (role === 'physician') {
    isAuthorized = !!physicianToken;
  } else {
    isAuthorized = !!patientToken || !!physicianToken;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return children;
}
