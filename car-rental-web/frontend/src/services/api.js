// ============================================================================
// API SERVICE - MOCK IMPLEMENTATION
// ============================================================================
// This file contains all API endpoints that are replaced with mock data
// Each function simulates a network call with realistic delay

import {
  mockUsers,
  mockCars,
  mockBookings,
  mockBookedDates,
  mockPricingSurges,
  mockStats,
  simulateNetworkDelay,
  simulateError
} from '../mocks/mockData';

// Local storage for user state
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let allBookings = [...mockBookings];
let allCars = [...mockCars];
let allUsers = [...mockUsers];

// ============================================================================
// AUTHENTICATION APIs
// ============================================================================

/**
 * Login API
 * @param {Object} credentials - { email, password }
 * @returns {Promise}
 */
export const loginAPI = async (credentials) => {
  console.log('[MOCK API] loginAPI called with:', credentials);
  
  // Simulate validation
  const user = mockUsers.find(u => u.email === credentials.email);
  
  if (!user) {
    return simulateError('Invalid email or password', 401);
  }

  // Mock successful login - in real app, backend would verify password
  currentUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar
  };

  const response = await simulateNetworkDelay({
    data: currentUser
  });

  return response;
};

/**
 * Register API
 * @param {Object} userData - { name, email, password }
 * @returns {Promise}
 */
export const registerAPI = async (userData) => {
  console.log('[MOCK API] registerAPI called with:', userData);

  // Check if user exists
  if (mockUsers.find(u => u.email === userData.email)) {
    return simulateError('Email already registered', 400);
  }

  // Create new user
  const newUser = {
    _id: '507f' + Math.random().toString(36).substr(2, 9),
    name: userData.name,
    email: userData.email,
    password: 'hashed_' + userData.password,
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    phone: userData.phone || '',
    avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${userData.name}`
  };

  allUsers.push(newUser);

  currentUser = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    phone: newUser.phone,
    avatar: newUser.avatar
  };

  const response = await simulateNetworkDelay({
    data: currentUser
  });

  return response;
};

/**
 * Google Login API
 * @param {Object} tokenData - { token }
 * @returns {Promise}
 */
export const googleLoginAPI = async (tokenData) => {
  console.log('[MOCK API] googleLoginAPI called');

  // Simulate Google auth - in real app, backend would verify token
  const mockGoogleUser = {
    _id: 'google_' + Math.random().toString(36).substr(2, 9),
    name: 'Google User',
    email: 'googleuser@gmail.com',
    role: 'user',
    phone: '',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Google'
  };

  currentUser = mockGoogleUser;

  const response = await simulateNetworkDelay({
    data: currentUser
  });

  return response;
};

// ============================================================================
// CARS APIs
// ============================================================================

/**
 * Get all cars with optional filters
 * @param {Object} params - { brand, type, search, lat, lng, radius }
 * @returns {Promise}
 */
export const getCarsAPI = async (params = {}) => {
  console.log('[MOCK API] getCarsAPI called with params:', params);

  let filteredCars = [...allCars];

  // Apply brand filter
  if (params.brand) {
    filteredCars = filteredCars.filter(car => car.brand === params.brand);
  }

  // Apply type filter
  if (params.type) {
    filteredCars = filteredCars.filter(car => car.type === params.type);
  }

  // Apply search filter (brand/model/name)
  if (params.search) {
    const search = params.search.toLowerCase();
    filteredCars = filteredCars.filter(car =>
      car.name.toLowerCase().includes(search) ||
      car.brand.toLowerCase().includes(search) ||
      car.model.toLowerCase().includes(search)
    );
  }

  // Apply location/radius filter (basic distance calculation)
  if (params.lat && params.lng) {
    const radius = params.radius || 50;
    filteredCars = filteredCars.filter(car => {
      const dist = Math.sqrt(
        Math.pow(car.pickupLocationCoords.lat - params.lat, 2) +
        Math.pow(car.pickupLocationCoords.lng - params.lng, 2)
      ) * 111; // rough km conversion
      return dist <= radius;
    });
  }

  const response = await simulateNetworkDelay({
    data: filteredCars
  });

  return response;
};

/**
 * Get single car by ID
 * @param {string} carId
 * @returns {Promise}
 */
export const getCarByIdAPI = async (carId) => {
  console.log('[MOCK API] getCarByIdAPI called for:', carId);

  const car = allCars.find(c => c._id === carId);

  if (!car) {
    return simulateError('Car not found', 404);
  }

  const response = await simulateNetworkDelay({
    data: car
  });

  return response;
};

/**
 * Create a new car (Admin only)
 * @param {Object} carData
 * @returns {Promise}
 */
export const createCarAPI = async (carData) => {
  console.log('[MOCK API] createCarAPI called with:', carData);

  const newCar = {
    _id: '507f' + Math.random().toString(36).substr(2, 9),
    ...carData,
    availability: true,
    features: carData.features || [],
    reviews: [],
    pickupLocationCoords: carData.pickupLocationCoords || { lat: 10.8141, lng: 106.6663 },
    galleryImages: carData.galleryImages || [carData.imageUrl]
  };

  allCars.push(newCar);

  const response = await simulateNetworkDelay({
    data: newCar,
    message: 'Car created successfully'
  });

  return response;
};

/**
 * Delete car (Admin only)
 * @param {string} carId
 * @returns {Promise}
 */
export const deleteCarAPI = async (carId) => {
  console.log('[MOCK API] deleteCarAPI called for:', carId);

  const index = allCars.findIndex(c => c._id === carId);
  if (index === -1) {
    return simulateError('Car not found', 404);
  }

  allCars.splice(index, 1);

  const response = await simulateNetworkDelay({
    data: { success: true },
    message: 'Car deleted successfully'
  });

  return response;
};

// ============================================================================
// BOOKINGS APIs
// ============================================================================

/**
 * Get current user's bookings
 * @returns {Promise}
 */
export const getMyBookingsAPI = async () => {
  console.log('[MOCK API] getMyBookingsAPI called');

  if (!currentUser) {
    return simulateError('Not authenticated', 401);
  }

  // Filter bookings for current user
  const userBookings = allBookings.filter(b => b.customer?._id === currentUser._id || b.customerEmail === currentUser.email);

  const response = await simulateNetworkDelay({
    data: userBookings
  });

  return response;
};

/**
 * Get booking by ID
 * @param {string} bookingId
 * @returns {Promise}
 */
export const getBookingByIdAPI = async (bookingId) => {
  console.log('[MOCK API] getBookingByIdAPI called for:', bookingId);

  const booking = allBookings.find(b => b._id === bookingId);

  if (!booking) {
    return simulateError('Booking not found', 404);
  }

  const response = await simulateNetworkDelay({
    data: booking
  });

  return response;
};

/**
 * Get all bookings (Admin only)
 * @returns {Promise}
 */
export const getAllBookingsAPI = async () => {
  console.log('[MOCK API] getAllBookingsAPI called');

  const response = await simulateNetworkDelay({
    data: allBookings
  });

  return response;
};

/**
 * Create new booking
 * @param {Object} bookingPayload
 * @returns {Promise}
 */
export const createBookingAPI = async (bookingPayload) => {
  console.log('[MOCK API] createBookingAPI called with:', bookingPayload);

  if (!currentUser) {
    return simulateError('Not authenticated', 401);
  }

  const car = allCars.find(c => c._id === bookingPayload.car);
  if (!car) {
    return simulateError('Car not found', 404);
  }

  const newBooking = {
    _id: '507f' + Math.random().toString(36).substr(2, 9),
    ...bookingPayload,
    customer: currentUser,
    transactionId: 'TXN' + Date.now(),
    createdAt: new Date().toISOString(),
    car: car,
    lateFee: 0
  };

  allBookings.push(newBooking);

  const response = await simulateNetworkDelay({
    data: newBooking
  });

  return response;
};

/**
 * Confirm payment for booking
 * @param {Object} paymentData - { bookingId }
 * @returns {Promise}
 */
export const confirmPaymentAPI = async (paymentData) => {
  console.log('[MOCK API] confirmPaymentAPI called for:', paymentData.bookingId);

  const booking = allBookings.find(b => b._id === paymentData.bookingId);
  if (!booking) {
    return simulateError('Booking not found', 404);
  }

  // Update booking status
  booking.paymentStatus = 'paid';
  booking.status = 'Approved';

  const response = await simulateNetworkDelay({
    data: {
      booking: booking,
      message: 'Payment confirmed successfully'
    }
  });

  return response;
};

/**
 * Update booking status (Admin only)
 * @param {string} bookingId
 * @param {string} status - 'Approved', 'Pending', 'Completed', 'Cancelled'
 * @returns {Promise}
 */
export const updateBookingStatusAPI = async (bookingId, status) => {
  console.log('[MOCK API] updateBookingStatusAPI called for:', bookingId, 'status:', status);

  const booking = allBookings.find(b => b._id === bookingId);
  if (!booking) {
    return simulateError('Booking not found', 404);
  }

  booking.status = status;

  const response = await simulateNetworkDelay({
    data: booking,
    message: `Booking status updated to ${status}`
  });

  return response;
};

// ============================================================================
// AVAILABILITY & PRICING APIs
// ============================================================================

/**
 * Get booked dates for a car
 * @param {string} carId
 * @returns {Promise}
 */
export const getAvailabilityByCarAPI = async (carId) => {
  console.log('[MOCK API] getAvailabilityByCarAPI called for:', carId);

  const bookedDates = mockBookedDates[carId] || [];

  const response = await simulateNetworkDelay({
    data: bookedDates
  });

  return response;
};

/**
 * Get pricing for a date range
 * @param {string} carId
 * @param {Object} dateRange - { startDate, endDate }
 * @returns {Promise}
 */
export const getCarPricingAPI = async (carId, dateRange) => {
  console.log('[MOCK API] getCarPricingAPI called for:', carId, 'dates:', dateRange);

  const car = allCars.find(c => c._id === carId);
  if (!car) {
    return simulateError('Car not found', 404);
  }

  // Calculate dynamic pricing based on surge data
  const surgePricing = mockPricingSurges.find(s => s.carId === carId);
  const dynamicPrice = surgePricing ? surgePricing.dynamicPrice : car.pricePerDay;

  const response = await simulateNetworkDelay({
    data: {
      basePrice: car.pricePerDay,
      dynamicPricePerDay: dynamicPrice,
      surgePercentage: surgePricing ? surgePricing.surgePercentage : 0,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    }
  });

  return response;
};

/**
 * Get availability calendar (Admin only)
 * @returns {Promise}
 */
export const getAvailabilityCalendarAPI = async () => {
  console.log('[MOCK API] getAvailabilityCalendarAPI called');

  // Flatten all booked dates
  const allBookedDates = Object.values(mockBookedDates).flat();

  const response = await simulateNetworkDelay({
    data: allBookedDates
  });

  return response;
};

/**
 * Get pricing surges (Admin only)
 * @returns {Promise}
 */
export const getPricingSurgesAPI = async () => {
  console.log('[MOCK API] getPricingSurgesAPI called');

  const response = await simulateNetworkDelay({
    data: mockPricingSurges
  });

  return response;
};

// ============================================================================
// USERS APIs (Admin only)
// ============================================================================

/**
 * Get all users (Admin only)
 * @returns {Promise}
 */
export const getUsersAPI = async () => {
  console.log('[MOCK API] getUsersAPI called');

  // Return users without passwords
  const usersWithoutPasswords = allUsers.map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    phone: u.phone,
    avatar: u.avatar,
    createdAt: u.createdAt
  }));

  const response = await simulateNetworkDelay({
    data: usersWithoutPasswords
  });

  return response;
};

/**
 * Delete user (Admin only)
 * @param {string} userId
 * @returns {Promise}
 */
export const deleteUserAPI = async (userId) => {
  console.log('[MOCK API] deleteUserAPI called for:', userId);

  const index = allUsers.findIndex(u => u._id === userId);
  if (index === -1) {
    return simulateError('User not found', 404);
  }

  allUsers.splice(index, 1);

  const response = await simulateNetworkDelay({
    data: { success: true },
    message: 'User deleted successfully'
  });

  return response;
};

/**
 * Toggle user status (Admin only)
 * @param {string} userId
 * @returns {Promise}
 */
export const toggleUserStatusAPI = async (userId) => {
  console.log('[MOCK API] toggleUserStatusAPI called for:', userId);

  const user = allUsers.find(u => u._id === userId);
  if (!user) {
    return simulateError('User not found', 404);
  }

  user.status = user.status === 'active' ? 'inactive' : 'active';

  const response = await simulateNetworkDelay({
    data: {
      ...user,
      password: undefined
    },
    message: `User status changed to ${user.status}`
  });

  return response;
};

// ============================================================================
// DASHBOARD APIs (Admin only)
// ============================================================================

/**
 * Get dashboard statistics (Admin only)
 * @returns {Promise}
 */
export const getStatsAPI = async () => {
  console.log('[MOCK API] getStatsAPI called');

  const response = await simulateNetworkDelay({
    data: mockStats
  });

  return response;
};

// ============================================================================
// DEBUG HELPERS
// ============================================================================

/**
 * Reset all mock data to initial state
 * Useful for testing
 */
export const resetMockData = () => {
  console.log('[MOCK API] Resetting all mock data to initial state');
  allBookings = [...mockBookings];
  allCars = [...mockCars];
  allUsers = [...mockUsers];
  currentUser = null;
};

/**
 * Get current mock state (for debugging)
 */
export const getMockState = () => {
  return {
    currentUser,
    totalBookings: allBookings.length,
    totalCars: allCars.length,
    totalUsers: allUsers.length,
    bookings: allBookings,
    cars: allCars,
    users: allUsers
  };
};

console.log('%c[MOCK API SERVICE INITIALIZED]', 'color: #22c55e; font-weight: bold;');
console.log('Using Mock Data instead of real API calls');
console.log('This is for development and testing purposes only');
