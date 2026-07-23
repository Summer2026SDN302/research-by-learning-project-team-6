const express = require('express');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');
const router = express.Router();

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      req.user = null;
    }
  }
  next();
};

const restrictAdminBookings = (req, res, next) => {
  if (req.user?.role === 'admin' && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return res.status(403).json({ message: 'Admin access to bookings is read-only' });
  }
  next();
};

router.use(optionalAuth);
router.use(restrictAdminBookings);

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

// ─── Seller routes ────────────────────────────────────────────────────────────
router.get('/seller/my-bookings', protect, async (req, res) => {
  try {
    const Car = require('../models/Car');
    const sellerCars = await Car.find({ owner: req.user.id }).select('_id');
    const carIds = sellerCars.map(c => c._id);
    const bookings = await Booking.find({ car: { $in: carIds } })
      .populate('user', 'name email')
      .populate('car', 'name brand imageUrl pricePerDay')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/seller/:id/status', protect, async (req, res) => {
  try {
    const Car = require('../models/Car');
    const booking = await Booking.findById(req.params.id).populate('car');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!booking.car.owner || booking.car.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized - not your car' });
    }
    booking.status = req.body.status;
    await booking.save();

    const Notification = require('../models/Notification');
    await Notification.create({
      user: booking.user,
      title: 'Booking Status Updated',
      body: `Your booking for ${booking.car.brand} ${booking.car.name} has been ${req.body.status.toLowerCase()} by the owner.`,
      type: 'booking',
      relatedId: booking._id.toString()
    }).catch(() => {});

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── General Admin CRUD ───────────────────────────────────────────────────────
router.get('/', protect, adminOnly, getAllBookings);
router.put('/:id', protect, adminOnly, updateBooking);
router.delete('/:id', protect, adminOnly, deleteBooking);

module.exports = router;
