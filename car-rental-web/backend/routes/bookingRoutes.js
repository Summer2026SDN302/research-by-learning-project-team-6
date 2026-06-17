const express = require('express');
const { getAllBookings, getMyBookings, getBookingById, createBooking, updateBooking, deleteBooking } = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  extendBooking,
  getAvailabilityByCar
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

// Get all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find()

            .populate('user')
            .populate('car');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user')
            .populate('car');
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create booking
router.post('/', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update booking
router.put('/:id', async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedBooking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete booking
router.delete('/:id', async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Public/Customer Routes
router.post('/customer', protect, createBooking);
router.get('/customer/my-bookings', protect, getMyBookings);
router.get('/customer/:id', protect, getBookingById);
router.get('/customer/availability/:carId', getAvailabilityByCar);
router.post('/customer/:id/extend', protect, extendBooking);
router.patch('/customer/:id/cancel', protect, cancelBooking);
module.exports = router;
