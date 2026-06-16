import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const loginAPI = (data) => API.post('/auth/login', data);
export const registerAPI = (data) => API.post('/auth/register', data);
export const googleLoginAPI = (data) => API.post('/auth/google', data);
export const verifyEmailAPI = (data) => API.get('/auth/verify-email', { params: data });
export const forgotPasswordAPI = (data) => API.post('/auth/forgot-password', data);
export const resetPasswordAPI = (data) => API.post('/auth/reset-password', data);
export const changePasswordAPI = (data) => API.put('/auth/change-password', data);
export const logoutAPI = (data) => API.post('/auth/logout', data);
export const logoutAllDevicesAPI = () => API.post('/auth/logout-all');
export const getUsersAPI = () => API.get('/auth/users');
export const deleteUserAPI = (id) => API.delete(`/auth/users/${id}`);
export const toggleUserStatusAPI = (id) => API.put(`/auth/users/${id}/status`);
export const confirmPaymentAPI = (data) => API.post('/payments/confirm', data);

// Cars
export const getCarsAPI = (params) => API.get('/cars', { params });
export const getCarByIdAPI = (id) => API.get(`/cars/${id}`);
export const getCarPricingAPI = (id, params) => API.get(`/cars/${id}/pricing`, { params });
export const createCarAPI = (data) => API.post('/cars', data);
export const updateCarAPI = (id, data) => API.put(`/cars/${id}`, data);
export const deleteCarAPI = (id) => API.delete(`/cars/${id}`);

// Bookings
export const createBookingAPI = (data) => API.post('/bookings', data);
export const getMyBookingsAPI = () => API.get('/bookings/my-bookings');
export const getBookingByIdAPI = (id) => API.get(`/bookings/${id}`);
export const getAllBookingsAPI = () => API.get('/bookings');
export const updateBookingStatusAPI = (id, status) => API.put(`/bookings/${id}`, { status });
export const deleteBookingAPI = (id) => API.delete(`/bookings/${id}`);
export const getStatsAPI = () => API.get('/analytics/dashboard-stats');
export const getTopCarsAPI = () => API.get('/analytics/top-cars');
export const getAvailabilityByCarAPI = (carId) => API.get(`/bookings/availability/${carId}`);
export const getAvailabilityCalendarAPI = () => API.get('/analytics/surge-availability');
export const getPricingSurgesAPI = () => API.get('/analytics/price-optimization');
export const chatAIAPI = (data) => API.post('/ai/chat', data);