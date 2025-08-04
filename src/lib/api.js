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
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  registerDriver: (driverData) => api.post('/auth/register-driver', driverData),
  logout: () => api.post('/auth/logout'),
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
  getJobHistory: (params) => api.get('/drivers/jobs/history', { params }),
  updateJobStatus: (id, data) => api.put(`/drivers/jobs/${id}/status`, data),
  updateLocation: (data) => api.put('/drivers/location', data),
  getEarnings: (params) => api.get('/drivers/earnings', { params }),
  updateAvailability: (status) => api.put('/drivers/availability', { status }),

  // Vehicle management
  addVehicle: (data) => api.post('/drivers/vehicles', data),
  getVehicles: () => api.get('/drivers/vehicles'),
};

export const adminAPI = {
  getDashboard: (params) => api.get('/admin/dashboard', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  deleteUser: (id, reason = null) => {
    const data = reason ? { reason } : {};
    return api.delete(`/admin/users/${id}`, { data });
  },
  updateDriverApproval: (id, data) =>
    api.put(`/admin/drivers/${id}/approve`, data),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  updateBookingStatus: (id, data) =>
    api.put(`/admin/bookings/${id}/status`, data),
  // Pricing methods
  getPricing: () => api.get('/admin/pricing'),
  updatePricing: (data) => api.put('/admin/pricing', data),
  resetPricing: () => api.post('/admin/pricing/reset'),
  // Reports method
  generateReport: (type, params) =>
    api.get(`/admin/reports/${type}`, { params }),

  // Admin profile management
  getAdminProfile: () => api.get('/auth/admin/profile'),
  updateAdminProfile: (data) => api.put('/auth/admin/profile', data),
  changeAdminPassword: (data) => api.put('/auth/admin/password', data),

  // Settings management
  getAdminSettings: () => api.get('/admin/settings'),
  updateAdminSettings: (data) => api.put('/admin/settings', data),

  // System actions
  clearCache: () => api.post('/admin/system/clear-cache'),
  exportLogs: () => api.get('/admin/system/logs/export'),
  createBackup: () => api.post('/admin/system/backup'),
  restartSystem: () => api.post('/admin/system/restart'),
  getSystemStats: () => api.get('/admin/system/stats'),
};
