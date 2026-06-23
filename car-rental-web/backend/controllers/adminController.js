const Voucher = require('../models/Voucher');
const PricingSurge = require('../models/PricingSurge');
const Booking = require('../models/Booking');
const Car = require('../models/Car');

// ═══════════════════════════════════════════════════════
//  VOUCHER MANAGEMENT
// ═══════════════════════════════════════════════════════

// GET /api/admin/vouchers
exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/vouchers
exports.createVoucher = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscountAmount, startDate, endDate, limit } = req.body;
    const voucher = await Voucher.create({
      code: code?.toUpperCase().trim(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      startDate,
      endDate,
      limit: limit || null,
    });
    res.status(201).json(voucher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/admin/vouchers/:id
exports.updateVoucher = async (req, res) => {
  try {
    const updated = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Voucher not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/admin/vouchers/:id
exports.deleteVoucher = async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Voucher deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════
//  DYNAMIC PRICING SURGES
// ═══════════════════════════════════════════════════════

// GET /api/admin/pricing-surges  — real-time calculated prices
exports.getPricingSurges = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Fetch all active surges where today falls within the event window
    const activeSurges = await PricingSurge.find({
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).populate('car', 'name brand model pricePerDay imageUrl');

    const result = activeSurges
      .filter(s => s.car) // guard against orphan surges
      .map(s => ({
        surgeId: s._id,
        carId: s.car._id,
        carName: s.car.name,
        brand: s.car.brand,
        model: s.car.model,
        imageUrl: s.car.imageUrl,
        date: today,
        basePrice: s.car.pricePerDay,
        surgeMultiplier: s.multiplier,
        dynamicPrice: Math.round(s.car.pricePerDay * s.multiplier),
        reason: s.reason,
        startDate: s.startDate,
        endDate: s.endDate,
      }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/pricing-surges/all  — all surge records
exports.getAllPricingSurges = async (req, res) => {
  try {
    const surges = await PricingSurge.find()
      .populate('car', 'name brand model pricePerDay imageUrl')
      .sort({ createdAt: -1 });
    res.json(surges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/pricing-surges
exports.createPricingSurge = async (req, res) => {
  try {
    const { car, multiplier, reason, startDate, endDate } = req.body;
    const surge = await PricingSurge.create({ car, multiplier, reason, startDate, endDate });
    const populated = await PricingSurge.findById(surge._id).populate('car', 'name brand model pricePerDay imageUrl');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/admin/pricing-surges/:id
exports.updatePricingSurge = async (req, res) => {
  try {
    const updated = await PricingSurge.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('car', 'name brand model pricePerDay imageUrl');
    if (!updated) return res.status(404).json({ error: 'Surge not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/admin/pricing-surges/:id
exports.deletePricingSurge = async (req, res) => {
  try {
    await PricingSurge.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Pricing surge deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════
//  CAR AVAILABILITY TIMELINE GRID
// ═══════════════════════════════════════════════════════

// GET /api/admin/cars-timeline?startDate=YYYY-MM-DD
exports.getCarsTimeline = async (req, res) => {
  try {
    const { startDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();

    // Generate 10 date strings starting from startDate
    const dates = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const rangeStart = dates[0];
    const rangeEnd = dates[dates.length - 1];

    // Fetch all cars
    const cars = await Car.find({}, 'name brand model imageUrl pricePerDay type');

    // Fetch all bookings that overlap with our date range
    const bookings = await Booking.find({
      status: { $in: ['Pending', 'Approved', 'Completed'] },
      pickupDate: { $lte: new Date(rangeEnd + 'T23:59:59') },
      returnDate: { $gte: new Date(rangeStart + 'T00:00:00') },
    }).select('car pickupDate returnDate status');

    // Build timeline for each car
    const timeline = cars.map(car => {
      const carBookings = bookings.filter(b => b.car.toString() === car._id.toString());

      const schedule = dates.map(dateStr => {
        const dayStart = new Date(dateStr + 'T00:00:00');
        const dayEnd = new Date(dateStr + 'T23:59:59');

        const isBooked = carBookings.some(b => {
          const bStart = new Date(b.pickupDate);
          const bEnd = new Date(b.returnDate);
          return bStart <= dayEnd && bEnd >= dayStart;
        });

        return { date: dateStr, status: isBooked ? 'booked' : 'available' };
      });

      return {
        carId: car._id,
        carName: car.name,
        brand: car.brand,
        model: car.model,
        imageUrl: car.imageUrl,
        pricePerDay: car.pricePerDay,
        type: car.type,
        schedule,
      };
    });

    res.json({ dates, timeline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════
//  MONTHLY CALENDAR OCCUPANCY LOGS
// ═══════════════════════════════════════════════════════

// GET /api/admin/calendar-occupancy?month=YYYY-MM
exports.getCalendarOccupancy = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM.' });
    }

    const [year, mon] = month.split('-').map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();

    // Total number of cars in the fleet
    const totalCars = await Car.countDocuments();
    if (totalCars === 0) return res.json([]);

    // Fetch all bookings overlapping this month
    const monthStart = new Date(year, mon - 1, 1);
    const monthEnd = new Date(year, mon - 1, daysInMonth, 23, 59, 59);

    const bookings = await Booking.find({
      status: { $in: ['Pending', 'Approved', 'Completed'] },
      pickupDate: { $lte: monthEnd },
      returnDate: { $gte: monthStart },
    }).select('pickupDate returnDate car');

    // Day-by-day calculation
    const result = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, mon - 1, day, 0, 0, 0);
      const dayEnd = new Date(year, mon - 1, day, 23, 59, 59);
      const dateStr = `${year}-${String(mon).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Count unique cars booked on this day
      const bookedCars = new Set();
      bookings.forEach(b => {
        const bStart = new Date(b.pickupDate);
        const bEnd = new Date(b.returnDate);
        if (bStart <= dayEnd && bEnd >= dayStart) {
          bookedCars.add(b.car.toString());
        }
      });

      const totalBookings = bookedCars.size;
      const occupancyRate = parseFloat(((totalBookings / totalCars) * 100).toFixed(1));

      result.push({ date: dateStr, occupancyRate, totalBookings });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
