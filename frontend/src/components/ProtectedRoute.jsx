import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute
 * - role: "patient" | "physician"
 * Wraps a route element and only renders it if the corresponding token is present.
 * Otherwise redirects to landing page ("/").
 */
export default function ProtectedRoute({ role, children }) {
  const patientToken = localStorage.getItem('token');
  const physicianToken = localStorage.getItem('physicianToken');

  let isAuthorized = false;
  if (role === 'patient') {
    isAuthorized = !!patientToken;
  } else if (role === 'physician') {
    isAuthorized = !!physicianToken;
  } else {
    // fallback: any logged-in user
    isAuthorized = !!patientToken || !!physicianToken;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return children;
}


