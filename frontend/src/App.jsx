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
import PhysicianAppointmentList from './pages/PhysicianAppointmentList';
import CreateHealthRecord from './pages/CreateHealthRecord';
import api, { patientSignup, patientLogin } from './services/api';
import PhysicianPatientList from './pages/PhysicianPatientList';
import PhysicianExtendedPatientDetail from './pages/PhysicianExtendedPatientDetail';
import ActivityLog from './pages/ActivityLog';
import CreateActivityLog from './pages/CreateActivityLog';
import EditActivityLog from './pages/EditActivityLog';
import PatientActivityLog from './pages/PatientActivityLog';
import PatientActivityLogDetail from './pages/PatientActivityLogDetail';
import CreatePatientActivityLog from './pages/CreatePatientActivityLog';


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
          <Route path="/physician/healthRecord/record/:recordId" element={<PhysicianHealthRecordDetail />} />
          <Route path="/physician/appointmentList" element={<PhysicianAppointmentList />} />
          <Route path="/physician/patientList" element={<PhysicianPatientList />} />
          <Route path="/physician/patient/:patientId/extended" element={<PhysicianExtendedPatientDetail />} />
          <Route path="/physician/healthrecord/create/:patientId" element={<CreateHealthRecord />} />
          <Route path="/physician/activity-log" element={<ActivityLog />} />
          <Route path="/physician/activity-log/new" element={<CreateActivityLog />} />
          <Route path="/physician/activity-log/edit/:logId" element={<EditActivityLog />} />
          <Route path="/physician/activity-log/patient/:patientId" element={<ActivityLog />} />
          <Route path="/patient/activity-log" element={<PatientActivityLog />} />
          <Route path="/patient/activity-log/:logId" element={<PatientActivityLogDetail />} />
        </Routes>
      </div>
    </Router>
  );
}
