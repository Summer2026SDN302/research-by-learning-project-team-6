const express = require('express');
const { getAllBookings, getMyBookings, getBookingById, createBooking, updateBooking, deleteBooking } = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/my-bookings', protect, getMyBookings);
router.get('/', protect, adminOnly, getAllBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.put('/:id', protect, adminOnly, updateBooking);
router.delete('/:id', protect, adminOnly, deleteBooking);

module.exports = router;
