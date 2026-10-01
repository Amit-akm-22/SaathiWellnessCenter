import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token from localStorage as fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect if already on login/register page
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Student API
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  submitScreening: (answers) => api.post('/student/screening', { answers }),
  bookAppointment: (data) => api.post('/student/appointments', data),
  getAppointments: (status) =>
    api.get(`/student/appointments${status ? `?status=${status}` : ''}`),
  getAppointment: (id) => api.get(`/student/appointments/${id}`),
  cancelAppointment: (id) => api.patch(`/student/appointments/${id}/cancel`),
  submitFeedback: (id, data) =>
    api.post(`/student/appointments/${id}/feedback`, data),
  updateProfile: (data) => api.put('/student/profile', data),
};

// Counselor API
export const counselorAPI = {
  getDashboard: () => api.get('/counselor/dashboard'),
  getAppointments: (params = {}) => api.get('/counselor/appointments', { params }),
  getAppointment: (id) => api.get(`/counselor/appointments/${id}`),
  approveAppointment: (id, data = {}) => api.patch(`/counselor/appointments/${id}/approve`, data),
  rejectAppointment: (id, data) => api.patch(`/counselor/appointments/${id}/reject`, data),
  startSession: (id) => api.patch(`/counselor/appointments/${id}/start-session`),
  endSession: (id) => api.patch(`/counselor/appointments/${id}/end-session`),
  markNoShow: (id) => api.patch(`/counselor/appointments/${id}/no-show`),
  saveNotes: (id, data) => api.put(`/counselor/appointments/${id}/notes`, data),
  handleUrgent: (id, data = {}) => api.patch(`/counselor/appointments/${id}/urgent`, data),
  setOnlineMeeting: (id, data) => api.patch(`/counselor/appointments/${id}/online-meeting`, data),
  delaySession: (id, data) => api.patch(`/counselor/appointments/${id}/delay`, data),
  reschedule: (id, data) => api.post(`/counselor/appointments/${id}/reschedule`, data),
  getStudents: (params = {}) => api.get('/counselor/students', { params }),
  getStudent: (id) => api.get(`/counselor/students/${id}`),
  getReports: (params = {}) => api.get('/counselor/reports', { params }),
  exportCSVUrl: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return `/api/counselor/reports/export-csv${qs ? `?${qs}` : ''}`;
  },
  getAnalytics: (params = {}) => api.get('/counselor/analytics', { params }),
  getNotificationLogs: (params = {}) => api.get('/counselor/notifications/log', { params }),
};

// FAQ API
export const faqAPI = {
  getAll: (search) => api.get(`/faqs${search ? `?search=${search}` : ''}`),
};

// Slot API
export const slotAPI = {
  getAvailable: (date) => api.get(`/slots?date=${date}`),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: (params = {}) => api.get('/admin/analytics', { params }),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  resetPassword: (id, data = {}) => api.post(`/admin/users/${id}/reset-password`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  restoreUser: (id) => api.post(`/admin/users/${id}/restore`),
  changeOwnPassword: (data) => api.post('/admin/change-password', data),
  importCSV: (formData) =>
    api.post('/admin/users/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAppointments: (params = {}) => api.get('/admin/appointments', { params }),
  overrideAppointment: (id, data) => api.put(`/admin/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/admin/appointments/${id}`),
  moderateFeedback: (id, data) => api.patch(`/admin/appointments/${id}/feedback`, data),
  recalculateCapacity: () => api.post('/admin/slots/recalculate'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  testNotification: (data) => api.post('/admin/settings/test-notification', data),
  getBlockedDates: () => api.get('/admin/blocked-dates'),
  addBlockedDate: (data) => api.post('/admin/blocked-dates', data),
  removeBlockedDate: (id) => api.delete(`/admin/blocked-dates/${id}`),
  getFAQs: () => api.get('/admin/faqs'),
  createFAQ: (data) => api.post('/admin/faqs', data),
  updateFAQ: (id, data) => api.put(`/admin/faqs/${id}`, data),
  deleteFAQ: (id) => api.delete(`/admin/faqs/${id}`),
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
  getNotificationLogs: (params = {}) => api.get('/admin/notification-logs', { params }),
  retryNotification: (id) => api.post(`/admin/notification-logs/${id}/retry`),
  exportUrl: (type) => `/api/admin/export/${type}`,
  getAnnouncement: () => api.get('/admin/announcement'),
};

export default api;

