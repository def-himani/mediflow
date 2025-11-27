import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5004';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 5000,
});

// Attach JWT tokens automatically based on route
api.interceptors.request.use((config) => {
    const isPatientRoute = config.url?.startsWith('/api/patient');
    const isPhysicianRoute = config.url?.startsWith('/api/physician');

    if (isPatientRoute) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    } else if (isPhysicianRoute) {
        const token = localStorage.getItem('physicianToken');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

// Global 401 handler: clear session and send user to landing page
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('physicianToken');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Adjust endpoints to match backend prefix
export const patientSignup = (data) => api.post('/api/patient/signup', data);
export const patientLogin = (data) => api.post('/api/patient/login', data);
export const getInsurances = () => api.get('/api/patient/insurances');
export const getPharmacies = () => api.get('/api/patient/pharmacies');
export const patientHealthRecord = () => api.post('/api/patient/healthRecord');
export const patientDashboard = () => api.post('/api/patient/dashboard');
export const getHealthRecordById = (recordId) => api.get(`/api/patient/healthRecord/record/${recordId}`);
export const getHealthRecordByIdPhysician = (recordId) => api.get(`/api/physician/healthRecord/record/${recordId}`);
export const createHealthRecord = (data) => api.post('/api/physician/healthRecord/create', data);

// Patient Profile endpoints
export const getPatientProfile = () => api.get('/api/patient/profile');
export const updatePatientProfile = (data) => api.put('/api/patient/profile/update', data);

// Physician endpoints
export const physicianProfile = () => api.get('/api/physician/profile');
export const physicianAppointments = () => api.get('/api/physician/appointments');
export const physicianPatients = () => api.get('/api/physician/patients');
export const physicianPatientVisits = (patientId) => api.get(`/api/physician/patient/${patientId}/visits`);
export const physicianDashboardSummary = () => api.get('/api/physician/dashboard-summary');
export const updateAppointmentStatus = (appointmentId, status) => api.put(`/api/physician/appointment/${appointmentId}/status`, { status });
export const physicianLogin = (data) => api.post('/api/physician/login', data);
export const physicianSignup = (data) => api.post('/api/physician/signup', data);

// Patient Activity Log endpoints
export const getActivityLogs = () => api.get('/api/patient/activitylogs');
export const getActivityLog = (logId) => api.get(`/api/patient/activitylog/${logId}`);
export const createActivityLog = (data) => api.post('/api/patient/activitylog/new', data);
export const updateActivityLog = (logId, data) => api.put(`/api/patient/activitylog/${logId}/edit`, data);
export const deleteActivityLog = (logId) => api.delete(`/api/patient/activitylog/${logId}/delete`);

// Physician Activity Log endpoints
export const physicianPatientActivityLogs = (patientId) => api.get(`/api/physician/patient/${patientId}/activitylogs`);
export const physicianPatientActivityLog = (patientId, logId) => api.get(`/api/physician/patient/${patientId}/activity/${logId}`);

// Appointment endpoints
export const getPhysicians = () => api.get('/api/patient/physicians');
export const getSpecializations = () => api.get('/api/patient/specializations');
export const bookAppointment = (data) => api.post('/api/patient/appointment/book', data);
export const getPatientAppointments = () => api.get('/api/patient/appointments');
export const cancelAppointment = (appointmentId) => api.put(`/api/patient/appointment/${appointmentId}/cancel`);

//Medications endpoint
export const getMedications = () => api.get('/api/physician/medications');

export default api;

