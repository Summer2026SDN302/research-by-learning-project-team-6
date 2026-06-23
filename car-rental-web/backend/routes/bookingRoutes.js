const express = require('express');
const Booking = require('../models/Booking');
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  extendBooking,
  getAvailabilityByCar,
  getAllBookings,
  updateBooking,
  deleteBooking,
  getAdminStats,
  getAvailabilityCalendar,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

// ─── Admin routes (no protect so legacy frontend keeps working) ───────────────
router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.get('/admin/availability', protect, adminOnly, getAvailabilityCalendar);

// ─── Customer routes ──────────────────────────────────────────────────────────
router.post('/customer', protect, createBooking);
router.get('/customer/my-bookings', protect, getMyBookings);
router.get('/customer/availability/:carId', getAvailabilityByCar);
router.get('/customer/:id', protect, getBookingById);
router.post('/customer/:id/extend', protect, extendBooking);
router.patch('/customer/:id/cancel', protect, cancelBooking);

// ─── General Admin CRUD ───────────────────────────────────────────────────────
router.get('/', protect, adminOnly, getAllBookings);
router.put('/:id', protect, adminOnly, updateBooking);
router.delete('/:id', protect, adminOnly, deleteBooking);

module.exports = router;
