import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page d-flex flex-column justify-content-center align-items-center vh-100 text-center">
      <h1>Welcome to MediFlow</h1>
      <p>
        Connecting patients and physicians for secure and accessible health management.
      </p>

      <div className="d-flex gap-3 flex-wrap justify-content-center">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/patient/signup')}
        >
          Patient Signup
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/physician/login')}
        >
          Physician Login
        </button>
      </div>
    </div>
  );
}
