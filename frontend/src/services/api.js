import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5004';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

// Adjust endpoints to match backend prefix
export const patientSignup = (data) => api.post('/api/patient/signup', data);
export const patientLogin = (data) => api.post('/api/patient/login', data);
export const getInsurances = () => api.get('/api/patient/insurances'); // use api instance
export const getPharmacies = () => api.get('/api/patient/pharmacies'); // use api instance
export const patientHealthRecord = () => api.post('/api/patient/healthRecord');
export const patientDashboard = () => api.post('/api/patient/dashboard');
export const getHealthRecordById = (recordId) => api.get(`/api/patient/healthRecord/record/${recordId}`);
export const getHealthRecordByIdPhysician = (recordId) => api.get(`/api/physician/healthRecord/record/${recordId}`);
export const createHealthRecord = (data) => api.post('/api/physician/healthRecord/create',data);

// Physician endpoints
export const physicianProfile = () => api.get('/api/physician/profile');
export const physicianAppointments = () => api.get('/api/physician/appointments');
export const physicianPatients = () => api.get('/api/physician/patients');
export const physicianPatientVisits = (patientId) => api.get(`/api/physician/patient/${patientId}/visits`);
export const physicianDashboardSummary = () => api.get('/api/physician/dashboard-summary');
export const updateAppointmentStatus = (appointmentId, status) => api.put(`/api/physician/appointment/${appointmentId}/status`, { status });
export const physicianLogin = (data) => api.post('/api/physician/login', data);
export const physicianSignup = (data) => api.post('/api/physician/signup', data);

// Activity Log APIs - Physician
export const getAllActivityLogs = () => api.get('/api/physician/activity-log');
export const getActivityLogById = (logId) => api.get(`/api/physician/activity-log/${logId}`);
export const createActivityLog = (data) => api.post('/api/physician/activity-log/create', data);
export const updateActivityLog = (logId, data) => api.put(`/api/physician/activity-log/update/${logId}`, data);
export const getActivityLogsByPatientId = (patientId) => api.get(`/api/physician/activity-log/patient/${patientId}`);

// Activity Log APIs - Patient
export const getPatientActivityLogs = () => api.get('/api/patient/activity-log');
export const getActivityLogByIdPatient = (logId) => api.get(`/api/patient/activity-log/${logId}`);
export const createPatientActivityLog = (data) => api.post('/api/patient/activity-log/create', data);
export const updatePatientActivityLog = (logId, data) => api.put(`/api/patient/activity-log/update/${logId}`, data);


export default api;
