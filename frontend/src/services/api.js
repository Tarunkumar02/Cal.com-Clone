import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Event Types API
export const eventTypesApi = {
  getAll: () => api.get('/event-types'),
  getById: (id) => api.get(`/event-types/${id}`),
  create: (data) => api.post('/event-types', data),
  update: (id, data) => api.put(`/event-types/${id}`, data),
  delete: (id) => api.delete(`/event-types/${id}`),
  toggle: (id) => api.patch(`/event-types/${id}/toggle`),
};

// Availability API
export const availabilityApi = {
  getAll: () => api.get('/availability'),
  getById: (id) => api.get(`/availability/${id}`),
  create: (data) => api.post('/availability', data),
  update: (id, data) => api.put(`/availability/${id}`, data),
  delete: (id) => api.delete(`/availability/${id}`),
  addOverride: (scheduleId, data) => api.post(`/availability/${scheduleId}/overrides`, data),
  updateOverride: (id, data) => api.put(`/availability/overrides/${id}`, data),
  deleteOverride: (id) => api.delete(`/availability/overrides/${id}`),
};

// Bookings API
export const bookingsApi = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  getStats: () => api.get('/bookings/stats'),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
  reschedule: (id, data) => api.post(`/bookings/${id}/reschedule`, data),
};

// Public Booking API
export const publicApi = {
  getEventType: (slug) => api.get(`/public/${slug}`),
  getAvailableDates: (slug, month, year) => api.get(`/public/${slug}/dates`, { params: { month, year } }),
  getAvailableSlots: (slug, date, timezone) => api.get(`/public/${slug}/slots`, { params: { date, timezone } }),
  createBooking: (slug, data) => api.post(`/public/${slug}/book`, data),
};

export default api;
