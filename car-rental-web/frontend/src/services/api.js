// ============================================================================
// API SERVICE - REAL IMPLEMENTATION
// ============================================================================
// This file contains all API endpoints that call the backend server
// Each function makes actual network requests to http://localhost:3000

const API_BASE_URL = 'http://localhost:3000/api';

// ============================================================================
// AUTHENTICATION APIs
// ============================================================================

export const loginAPI = async (credentials) => {
  console.log('[API] loginAPI called with:', credentials);
  
  try {
    const response = await fetch(`${API_BASE_URL}/users/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const userData = await response.json();
    return { data: userData };
  } catch (error) {
    console.error('[API] Login error:', error);
    throw error;
  }
};

export const registerAPI = async (userData) => {
  console.log('[API] registerAPI called with:', userData);

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) throw new Error('Registration failed');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] registerAPI error:', error);
    throw error;
  }
};

export const googleLoginAPI = async (tokenData) => {
  console.log('[API] googleLoginAPI called');

  try {
    const response = await fetch(`${API_BASE_URL}/users/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenData)
    });

    if (!response.ok) throw new Error('Google login failed');
    
    const userData = await response.json();
    return { data: userData };
  } catch (error) {
    console.error('[API] googleLoginAPI error:', error);
    throw error;
  }
};

// ============================================================================
// CARS APIs
// ============================================================================

export const getCarsAPI = async (params = {}) => {
  console.log('[API] getCarsAPI called with params:', params);

  try {
    const response = await fetch(`${API_BASE_URL}/cars`);
    if (!response.ok) throw new Error('Failed to fetch cars');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] getCarsAPI error:', error);
    throw error;
  }
};

export const getCarByIdAPI = async (carId) => {
  console.log('[API] getCarByIdAPI called for:', carId);

  try {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}`);
    if (!response.ok) throw new Error('Car not found');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] getCarByIdAPI error:', error);
    throw error;
  }
};

export const createCarAPI = async (carData) => {
  console.log('[API] createCarAPI called with:', carData);

  try {
    const response = await fetch(`${API_BASE_URL}/cars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carData)
    });
    
    if (!response.ok) throw new Error('Failed to create car');
    
    const data = await response.json();
    return { data, message: 'Car created successfully' };
  } catch (error) {
    console.error('[API] createCarAPI error:', error);
    throw error;
  }
};

export const deleteCarAPI = async (carId) => {
  console.log('[API] deleteCarAPI called for:', carId);

  try {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete car');
    
    const data = await response.json();
    return { data, message: 'Car deleted successfully' };
  } catch (error) {
    console.error('[API] deleteCarAPI error:', error);
    throw error;
  }
};

// ============================================================================
// BOOKINGS APIs
// ============================================================================

export const getMyBookingsAPI = async () => {
  console.log('[API] getMyBookingsAPI called');

  try {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] getMyBookingsAPI error:', error);
    throw error;
  }
};

export const getBookingByIdAPI = async (bookingId) => {
  console.log('[API] getBookingByIdAPI called for:', bookingId);

  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
    if (!response.ok) throw new Error('Booking not found');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] getBookingByIdAPI error:', error);
    throw error;
  }
};

export const getAllBookingsAPI = async () => {
  console.log('[API] getAllBookingsAPI called');

  try {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] getAllBookingsAPI error:', error);
    throw error;
  }
};

export const createBookingAPI = async (bookingPayload) => {
  console.log('[API] createBookingAPI called with:', bookingPayload);

  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    
    if (!response.ok) throw new Error('Failed to create booking');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] createBookingAPI error:', error);
    throw error;
  }
};

export const confirmPaymentAPI = async (paymentData) => {
  console.log('[API] confirmPaymentAPI called for:', paymentData.bookingId);

  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${paymentData.bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: 'paid', status: 'Approved' })
    });
    
    if (!response.ok) throw new Error('Payment confirmation failed');
    
    const data = await response.json();
    return { data, message: 'Payment confirmed successfully' };
  } catch (error) {
    console.error('[API] confirmPaymentAPI error:', error);
    throw error;
  }
};

export const updateBookingStatusAPI = async (bookingId, status) => {
  console.log('[API] updateBookingStatusAPI called for:', bookingId, 'status:', status);

  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error('Failed to update booking');
    
    const data = await response.json();
    return { data, message: `Booking status updated to ${status}` };
  } catch (error) {
    console.error('[API] updateBookingStatusAPI error:', error);
    throw error;
  }
};

// ============================================================================
// AVAILABILITY & PRICING APIs
// ============================================================================

export const getAvailabilityByCarAPI = async (carId) => {
  console.log('[API] getAvailabilityByCarAPI called for:', carId);

  try {
    const response = await fetch(`${API_BASE_URL}/bookings?carId=${carId}`);
    if (!response.ok) throw new Error('Failed to fetch availability');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] getAvailabilityByCarAPI error:', error);
    return { data: [] };
  }
};

export const getCarPricingAPI = async (carId, dateRange) => {
  console.log('[API] getCarPricingAPI called for:', carId, 'dates:', dateRange);

  try {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}/pricing?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
    if (!response.ok) throw new Error('Failed to fetch pricing');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] getCarPricingAPI error:', error);
    throw error;
  }
};

export const getAvailabilityCalendarAPI = async () => {
  console.log('[API] getAvailabilityCalendarAPI called');

  try {
    const response = await fetch(`${API_BASE_URL}/bookings`);
    if (!response.ok) throw new Error('Failed to fetch availability');
    
    const data = await response.json();
    return { data: data || [] };
  } catch (error) {
    console.error('[API] getAvailabilityCalendarAPI error:', error);
    return { data: [] };
  }
};

export const getPricingSurgesAPI = async () => {
  console.log('[API] getPricingSurgesAPI called');

  try {
    const response = await fetch(`${API_BASE_URL}/analytics/pricing-surge`);
    if (!response.ok) throw new Error('Failed to fetch pricing surges');
    
    const data = await response.json();
    return { data: data.surgePeriods || [] };
  } catch (error) {
    console.error('[API] getPricingSurgesAPI error:', error);
    return { data: [] };
  }
};

// ============================================================================
// USERS APIs (Admin only)
// ============================================================================

export const getUsersAPI = async () => {
  console.log('[API] getUsersAPI called');

  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] getUsersAPI error:', error);
    throw error;
  }
};

export const deleteUserAPI = async (userId) => {
  console.log('[API] deleteUserAPI called for:', userId);

  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete user');
    
    const data = await response.json();
    return { data, message: 'User deleted successfully' };
  } catch (error) {
    console.error('[API] deleteUserAPI error:', error);
    throw error;
  }
};

export const toggleUserStatusAPI = async (userId) => {
  console.log('[API] toggleUserStatusAPI called for:', userId);

  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'toggled' })
    });
    
    if (!response.ok) throw new Error('Failed to update user');
    
    const data = await response.json();
    return { data, message: 'User status changed' };
  } catch (error) {
    console.error('[API] toggleUserStatusAPI error:', error);
    throw error;
  }
};

// ============================================================================
// DASHBOARD APIs (Admin only)
// ============================================================================

export const getStatsAPI = async () => {
  console.log('[API] getStatsAPI called');

  try {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard-stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] getStatsAPI error:', error);
    throw error;
  }
};

// ============================================================================
// REVIEWS APIs
// ============================================================================

export const getReviewsAPI = async () => {
  console.log('[API] getReviewsAPI called');

  try {
    const response = await fetch(`${API_BASE_URL}/reviews`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] getReviewsAPI error:', error);
    throw error;
  }
};

export const createReviewAPI = async (reviewData) => {
  console.log('[API] createReviewAPI called with:', reviewData);

  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) throw new Error('Failed to create review');
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('[API] createReviewAPI error:', error);
    throw error;
  }
};

console.log('%c[API SERVICE INITIALIZED]', 'color: #3b82f6; font-weight: bold;');
console.log('Using Real API from http://localhost:3000');
