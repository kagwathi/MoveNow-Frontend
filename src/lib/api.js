import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  registerDriver: (driverData) => api.post('/auth/register-driver', driverData),
};

export const bookingAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) =>
    api.put(`/bookings/${id}/cancel`, { cancellation_reason: reason }),
  track: (id) => api.get(`/bookings/${id}/track`),
};

export const pricingAPI = {
  estimate: (data) => api.post('/pricing/estimate', data),
};

export const driverAPI = {
  getAvailableJobs: (params) => api.get('/drivers/jobs/available', { params }),
  acceptJob: (id) => api.post(`/drivers/jobs/${id}/accept`),
  getCurrentJob: () => api.get('/drivers/jobs/current'),
  updateJobStatus: (id, data) => api.put(`/drivers/jobs/${id}/status`, data),
  updateLocation: (data) => api.put('/drivers/location', data),
  getEarnings: (params) => api.get('/drivers/earnings', { params }),
  updateAvailability: (status) => api.put('/drivers/availability', { status }),
};

export const adminAPI = {
  getDashboard: (params) => api.get('/admin/dashboard', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  approveDriver: (id, data) => api.put(`/admin/drivers/${id}/approve`, data),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  updateBookingStatus: (id, data) =>
    api.put(`/admin/bookings/${id}/status`, data),
  getPricing: () => api.get('/admin/pricing'),
  updatePricing: (data) => api.put('/admin/pricing', data),
  generateReport: (type, params) =>
    api.get(`/admin/reports/${type}`, { params }),
};
