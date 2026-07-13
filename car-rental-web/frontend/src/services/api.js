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

// ==================== Bookings - Customer ====================

export const createBookingAPI = (data) =>
  API.post('/bookings/customer', data);

export const getMyBookingsAPI = () =>
  API.get('/bookings/customer/my-bookings');

export const getBookingByIdAPI = (id) =>
  API.get(`/bookings/customer/${id}`);

export const getAvailabilityByCarAPI = (carId) =>
  API.get(`/bookings/customer/availability/${carId}`);

export const extendBookingAPI = (id, data) =>
  API.post(`/bookings/customer/${id}/extend`, data);

export const cancelBookingAPI = (id) =>
  API.patch(`/bookings/customer/${id}/cancel`);


// ==================== Bookings - Admin ====================

export const getAllBookingsAPI = () =>
  API.get('/bookings');

export const updateBookingStatusAPI = (id, status) =>
  API.put(`/bookings/${id}`, { status });

export const deleteBookingAPI = (id) =>
  API.delete(`/bookings/${id}`);

export const getStatsAPI = () =>
  API.get('/bookings/admin/stats');

export const getAvailabilityCalendarAPI = () =>
  API.get('/bookings/admin/availability');


// ==================== Others ====================

export const getPricingSurgesAPI = () =>
  API.get('/analytics/pricing-surge');

export const chatAIAPI = (data) =>
  API.post('/ai/chat', data);

export const getAIChatHistoryAPI = () =>
  API.get('/ai/history');

export const getNotificationsAPI = () =>
  API.get('/notifications');

export const markNotificationReadAPI = (id) =>
  API.patch(`/notifications/${id}/read`);

export const markAllNotificationsReadAPI = () =>
  API.patch('/notifications/read-all');

export const createReviewAPI = (data) =>
  API.post('/reviews', data);

export const getReviewsAPI = (params) =>
  API.get('/reviews', { params });

export const deleteReviewAPI = (id) =>
  API.delete(`/reviews/${id}`);

// Admin - Vouchers
export const getAdminVouchersAPI = () => API.get('/admin/vouchers');
export const createAdminVoucherAPI = (data) => API.post('/admin/vouchers', data);
export const updateAdminVoucherAPI = (id, data) => API.put(`/admin/vouchers/${id}`, data);
export const deleteAdminVoucherAPI = (id) => API.delete(`/admin/vouchers/${id}`);

// Admin - Commissions
export const getAdminCommissionSummaryAPI = () => API.get('/admin/commissions');

// Admin - Seller Requests
export const getPendingSellerRequestsAPI = () => API.get('/admin/seller-requests');
export const reviewSellerRequestAPI = (id, data) => API.put(`/admin/seller-requests/${id}/review`, data);

// Admin - Pricing Surges
export const getAdminAllSurgesAPI = () => API.get('/admin/pricing-surges/all');
export const getAdminActiveSurgesAPI = () => API.get('/admin/pricing-surges');
export const createAdminSurgeAPI = (data) => API.post('/admin/pricing-surges', data);
export const updateAdminSurgeAPI = (id, data) => API.put(`/admin/pricing-surges/${id}`, data);
export const deleteAdminSurgeAPI = (id) => API.delete(`/admin/pricing-surges/${id}`);

// Admin - Timeline & Occupancy
export const getCarsTimelineAPI = (startDate) => API.get('/admin/cars-timeline', { params: { startDate } });
export const getCalendarOccupancyAPI = (month) => API.get('/admin/calendar-occupancy', { params: { month } });
export const getTopCarsAPI = () => API.get('/analytics/top-cars');
