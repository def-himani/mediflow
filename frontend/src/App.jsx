import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import PatientSignup from './pages/PatientSignup';
import PatientLogin from './pages/PatientLogin';
import PatientDashboard from './pages/PatientDashboard';
import PhysicianLogin from './pages/PhysicianLogin';
import PhysicianSignup from './pages/PhysicianSignup';
import PhysicianDashboard from './pages/PhysicianDashboard';
import PatientHealthRecord from './pages/PatientHealthRecord';
import HealthRecordDetail from './pages/HealthRecordDetail';
import PhysicianHealthRecordDetail from './pages/PhysicianHealthRecordDetail';
import api, { patientSignup, patientLogin } from './services/api';

export default function App() {
  
  // Example: calling signup (can be moved to SignupPage component)
  const handleSignup = async (formData) => {
    try {
      const response = await patientSignup(formData);
      console.log('Signup success:', response.data);
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
    }
  };

  // Example: calling login (can be moved to LoginPage component)
  const handleLogin = async (formData) => {
    try {
      const response = await patientLogin(formData);
      console.log('Login success:', response.data);
      // Save token/session here if using JWT
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
    }
  };

  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<PatientSignup onSubmit={handleSignup} />} />
          <Route path="/login" element={<PatientLogin onSubmit={handleLogin} />} />
          <Route path="/patientdashboard" element={<PatientDashboard />} />
          <Route path="/physicianlogin" element={<PhysicianLogin />} />
          <Route path="/physiciansignup" element={<PhysicianSignup />} />
          <Route path="/physiciandashboard" element={<PhysicianDashboard />} />
          <Route path="/patient/signup" element={<PatientSignup />} />
          <Route path="/physician/login" element={<PhysicianLogin />} />
          <Route path="/patient/healthRecord" element={<PatientHealthRecord />} />
          <Route path="/patient/healthrecord/:recordId" element={<HealthRecordDetail />} />
          <Route path="/physician/healthrecord/:recordId" element={<PhysicianHealthRecordDetail />} />
        </Routes>
      </div>
    </Router>
  );
}
