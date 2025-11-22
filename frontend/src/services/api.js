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
export const physicianLogin = (data) => api.post('/api/physician/login', data);
export const physicianSignup = (data) => api.post('/api/physician/signup', data);
export const patientHealthRecord = () => api.post('/api/patient/healthRecord');
export const getHealthRecordById = (recordId) => api.get(`/api/patient/healthRecord/record/${recordId}`);

export default api;
