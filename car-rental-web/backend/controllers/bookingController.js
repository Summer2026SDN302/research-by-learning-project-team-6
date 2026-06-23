const Booking = require('../models/Booking');
const Car = require('../models/Car');

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

const hasOverlap = (startA, endA, startB, endB) => startA <= endB && endA >= startB;

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const str = dateStr instanceof Date ? dateStr.toISOString().split('T')[0] : String(dateStr);
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

// ─────────────────────────────────────────────
//  CUSTOMER FUNCTIONS
// ─────────────────────────────────────────────

// POST /bookings/customer
exports.createBooking = async (req, res) => {
  try {
    const {
      car: carId,
      pickupDate,
      returnDate,
      pickupLocation,
      pickupLocationCoords,
      dropoffLocationCoords,
      distanceKm,
      addOns,
      paymentMethod,
      transactionId,
      customerName,
      customerEmail,
      customerPhone,
      note,
    } = req.body;

    const requestedStart = parseLocalDate(pickupDate);
    const requestedEnd = parseLocalDate(returnDate);

    // Kiểm tra trùng lịch xe
    const existingBookings = await Booking.find({
      car: carId,
      status: { $in: ['Approved', 'Pending'] },
    });

    const conflict = existingBookings.some((b) =>
      hasOverlap(requestedStart, requestedEnd, parseLocalDate(b.pickupDate), parseLocalDate(b.returnDate))
    );

    if (conflict) return res.status(409).json({ error: 'Car is unavailable for the selected dates.' });

    const carDoc = await Car.findById(carId);
    if (!carDoc) return res.status(404).json({ error: 'Car not found' });

    const totalDays = Math.max(1, Math.round((requestedEnd - requestedStart) / 86400000) + 1);

    // Tính giá động
    const { calculateDynamicPrice } = require('../utils/pricing');
    const pricingData = await calculateDynamicPrice(carDoc, requestedStart, requestedEnd);
    const basePrice = pricingData.dynamicPricePerDay * totalDays;

    const addOnPrices = { basic_insurance: 12, premium_insurance: 28, gps: 8, child_seat: 6 };
    const addOnsTotal = (addOns || []).reduce((sum, a) => sum + (addOnPrices[a] || 0) * totalDays, 0);

    const subtotal = basePrice + addOnsTotal;
    const serviceFee = Math.round(subtotal * 0.10 * 100) / 100;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const totalPrice = Math.round((subtotal + serviceFee + tax) * 100) / 100;

    const paymentStatus = paymentMethod === 'vietqr' ? 'pending' : 'paid';
    const bookingStatus = paymentStatus === 'paid' ? 'Approved' : 'Pending';

    const booking = await Booking.create({
      user: req.user.id,
      car: carId,
      pickupDate,
      returnDate,
      pickupLocation,
      pickupLocationCoords,
      dropoffLocationCoords,
      distanceKm,
      addOns,
      paymentStatus,
      paymentMethod,
      transactionId,
      totalPrice,
      customerName,
      customerEmail,
      customerPhone,
      note,
      status: bookingStatus,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET /bookings/customer/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('car');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /bookings/customer/my-bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('car');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /bookings/customer/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (booking.status === 'Completed') return res.status(400).json({ message: 'Cannot cancel completed booking' });
    if (booking.status === 'Cancelled') return res.status(400).json({ message: 'Already cancelled' });

    const now = new Date();
    const pickup = new Date(booking.pickupDate);
    if ((pickup - now) / 3600000 < 24 && booking.status === 'Approved') {
      return res.status(400).json({ message: 'Must cancel 24h before pickup' });
    }

    booking.status = 'Cancelled';
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /bookings/customer/:id/extend
exports.extendBooking = async (req, res) => {
  try {
    const { newReturnDate } = req.body;
    const booking = await Booking.findById(req.params.id).populate('car');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const requestedStart = parseLocalDate(booking.returnDate);
    const requestedEnd = parseLocalDate(newReturnDate);

    if (requestedEnd <= requestedStart) {
      return res.status(400).json({ error: 'New return date must be after current return date.' });
    }

    const approvedBookings = await Booking.find({
      car: booking.car._id,
      status: 'Approved',
      _id: { $ne: booking._id },
    });

    const conflict = approvedBookings.some((b) =>
      hasOverlap(requestedStart, requestedEnd, parseLocalDate(b.pickupDate), parseLocalDate(b.returnDate))
    );

    if (conflict) return res.status(409).json({ error: 'Car already booked for these extended dates.' });

    const extraDays = Math.max(1, Math.round((requestedEnd - requestedStart) / 86400000));
    const pricePerDay = booking.car.pricePerDay || 0;
    const extraPrice = extraDays * pricePerDay;

    booking.returnDate = requestedEnd;
    booking.totalPrice = Number(booking.totalPrice) + Number(extraPrice);
    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error('Error in extendBooking:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /bookings/customer/availability/:carId
exports.getAvailabilityByCar = async (req, res) => {
  try {
    const bookings = await Booking.find({
      car: req.params.carId,
      status: { $in: ['Pending', 'Approved', 'Completed'] },
    }).select('pickupDate returnDate status');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
//  ADMIN FUNCTIONS (used by bookingRoutes)
// ─────────────────────────────────────────────

// GET /bookings  (admin: get all)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user').populate('car').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /bookings/:id  (admin: update status)
exports.updateBooking = async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /bookings/:id  (admin)
exports.deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /bookings/admin/stats  (used by old frontend getStatsAPI)
exports.getAdminStats = async (req, res) => {
  try {
    const User = require('../models/User');
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'Active' });
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const totalCars = await Car.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const revenue = revenueData[0]?.totalRevenue || 0;

    const monthlyRevenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);
    const monthlyRevenue = {};
    monthlyRevenueData.forEach(item => { monthlyRevenue[`${item._id.year}-${item._id.month}`] = item.revenue; });

    const bookingsByLocationData = await Booking.aggregate([
      { $group: { _id: '$pickupLocation', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const bookingsByLocation = {};
    bookingsByLocationData.forEach(item => { bookingsByLocation[item._id || 'Unknown'] = item.count; });

    const bookingStatusStatsData = await Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const bookingStatusStats = { Pending: 0, Approved: 0, Completed: 0, Cancelled: 0 };
    bookingStatusStatsData.forEach(item => { if (bookingStatusStats.hasOwnProperty(item._id)) bookingStatusStats[item._id] = item.count; });

    res.json({ totalUsers, activeUsers, newUsersThisMonth, totalCars, totalBookings, revenue, monthlyRevenue, bookingsByLocation, bookingStatusStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /bookings/admin/availability
exports.getAvailabilityCalendar = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: { $in: ['Approved', 'Completed'] } })
      .populate('car', 'name brand imageUrl')
      .select('pickupDate returnDate status car');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
