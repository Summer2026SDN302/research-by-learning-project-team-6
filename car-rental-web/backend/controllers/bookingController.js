const mongoose = require('mongoose');
const Booking = require('../models/Booking');

// Get current user's bookings
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('car')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all bookings (Admin only)
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user')
            .populate('car')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        const booking = await Booking.findById(req.params.id)
            .populate('user')
            .populate('car');
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create booking
exports.createBooking = async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update booking (Admin only)
exports.updateBooking = async (req, res) => {
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
};

// Delete booking (Admin only)
exports.deleteBooking = async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
