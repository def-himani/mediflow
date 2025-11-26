import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
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
import PhysicianPatientList from './pages/PhysicianPatientList';
import PhysicianExtendedPatientDetail from './pages/PhysicianExtendedPatientDetail';
import ActivityLog from './pages/ActivityLog';
import NewActivity from './pages/NewActivity';
import EditActivityLog from './pages/EditActivityLog';
import PhysicianPatientActivityLog from './pages/PhysicianPatientActivityLog';
import PhysicianViewActivityLog from './pages/PhysicianViewActivityLog';
import PatientProfile from './pages/PatientProfile';
import BookAppointment from './pages/BookAppointment';


export default function App() {
    return (
        <Router>
            <Navbar />
            <div className="container mt-4">
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/signup" element={<PatientSignup />} />
                    <Route path="/login" element={<PatientLogin />} />
                    <Route path="/patient/signup" element={<PatientSignup />} />
                    <Route path="/physician/login" element={<PhysicianLogin />} />
                    <Route path="/physicianlogin" element={<PhysicianLogin />} />
                    <Route path="/physiciansignup" element={<PhysicianSignup />} />

                    {/* Patient protected routes */}
                    <Route
                        path="/patient/profile"
                        element={
                            <ProtectedRoute role="patient">
                                <PatientProfile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/appointment/book"
                        element={
                            <ProtectedRoute role="patient">
                                <BookAppointment />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/dashboard"
                        element={
                            <ProtectedRoute role="patient">
                                <PatientDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/healthRecord"
                        element={
                            <ProtectedRoute role="patient">
                                <PatientHealthRecord />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/healthrecord/:recordId"
                        element={
                            <ProtectedRoute role="patient">
                                <HealthRecordDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/activitylog"
                        element={
                            <ProtectedRoute role="patient">
                                <ActivityLog />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/activity/new"
                        element={
                            <ProtectedRoute role="patient">
                                <NewActivity />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/patient/activity/:logId/edit"
                        element={
                            <ProtectedRoute role="patient">
                                <EditActivityLog />
                            </ProtectedRoute>
                        }
                    />

                    {/* Physician protected routes */}
                    <Route
                        path="/physiciandashboard"
                        element={
                            <ProtectedRoute role="physician">
                                <PhysicianDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/physician/healthrecord/:recordId"
                        element={
                            <ProtectedRoute role="physician">
                                <PhysicianHealthRecordDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/physician/healthRecord/record/:recordId"
                        element={
                            <ProtectedRoute role="physician">
                                <PhysicianHealthRecordDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/physician/appointmentList"
                        element={
                            <ProtectedRoute role="physician">
                                <PhysicianAppointmentList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/physician/patientList"
                        element={
                            <ProtectedRoute role="physician">
                                <PhysicianPatientList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/physician/patient/:patientId/extended"
                        element={
                            <ProtectedRoute role="physician">
                                <PhysicianExtendedPatientDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/physician/healthrecord/create/:patientId"
                        element={
                            <ProtectedRoute role="physician">
                                <CreateHealthRecord />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/physician/patient/:patientId/activitylog"
                        element={
                            <ProtectedRoute role="physician">
                                <PhysicianPatientActivityLog />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/physician/patient/:patientId/activity/:logId/view"
                        element={
                            <ProtectedRoute role="physician">
                                <PhysicianViewActivityLog />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

