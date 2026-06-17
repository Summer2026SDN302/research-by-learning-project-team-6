const Booking = require('../models/Booking');

const hasOverlap = (startA, endA, startB, endB) => {
  return startA <= endB && endA >= startB;
};

// Đảm bảo hàm helper này nằm ở ngoài cùng đầu file controller
const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  // Nếu dateStr đã là đối tượng Date (do mongoose trả về), lấy string YYYY-MM-DD của nó
  const str = dateStr instanceof Date ? dateStr.toISOString().split('T')[0] : String(dateStr);
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0); 
};

/* =========================================================
    USER FUNCTIONS (KHÁCH HÀNG)
========================================================= */
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
      note
    } = req.body;

    const requestedStart = parseLocalDate(pickupDate);
    const requestedEnd = parseLocalDate(returnDate);

    // Kiểm tra trùng lịch xe
    const existingBookings = await Booking.find({
      car: carId,
      status: { $in: ['Approved', 'Pending'] }
    });

    const conflict = existingBookings.some((b) =>
      hasOverlap(
        requestedStart, 
        requestedEnd, 
        parseLocalDate(b.pickupDate), 
        parseLocalDate(b.returnDate)
      )
    );

    if (conflict)
      return res.status(409).json({ error: 'Car is unavailable for the selected dates.' });

    // Lấy thông tin xe để tính giá
    const Car = require('../models/Car');
    const carDoc = await Car.findById(carId);
    if (!carDoc) return res.status(404).json({ error: 'Car not found' });

    // Tính số ngày thuê thực tế
    const totalDays = Math.max(1, Math.round((requestedEnd - requestedStart) / 86400000) + 1);
    
    // Tính toán giá động bằng cách gọi sang pricing utils
    const { calculateDynamicPrice } = require('../utils/pricing');
    const pricingData = await calculateDynamicPrice(carDoc, requestedStart, requestedEnd);

    const basePrice = pricingData.dynamicPricePerDay * totalDays;

    const addOnPrices = { basic_insurance: 12, premium_insurance: 28, gps: 8, child_seat: 6 };
    const addOnsTotal = (addOns || []).reduce(
      (sum, a) => sum + (addOnPrices[a] || 0) * totalDays,
      0
    );

    const subtotal = basePrice + addOnsTotal;
    const serviceFee = Math.round(subtotal * 0.10 * 100) / 100;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const totalPrice = Math.round((subtotal + serviceFee + tax) * 100) / 100;

    const paymentStatus = paymentMethod === 'vietqr' ? 'pending' : 'paid';
    const bookingStatus = paymentStatus === 'paid' ? 'Approved' : 'Pending';

    // Tạo bản ghi lưu vào Database
    const booking = await Booking.create({
      user: req.user.id, // Lấy từ middleware protect truyền vào
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
      status: bookingStatus
    });

    // Bắn thông báo Admin
    try {
      const { pushNotification } = require('./adminController');
      pushNotification(
        req.user.id,
        bookingStatus === 'Approved' ? '✅ Đặt xe thành công!' : '⏳ Chờ xác nhận QR',
        bookingStatus === 'Approved' ? `Đặt xe thành công!` : `Chờ xác nhận thanh toán VietQR.`,
        'booking',
        booking._id.toString()
      );
    } catch (e) {
      console.log("Notification helper missing, skipped.");
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// USER: Xem booking theo ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('car');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // check quyền user
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// USER: Xem booking của tôi
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('car');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// USER: Hủy booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Already cancelled' });
    }

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

// USER: Gia hạn booking
// USER: Gia hạn booking
exports.extendBooking = async (req, res) => {
  try {
    const { newReturnDate } = req.body;
    const booking = await Booking.findById(req.params.id).populate('car');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // 🎯 SỬA TẠI ĐÂY: Ép kiểu dữ liệu ngày về dạng chuẩn Local 00:00:00 để tính toán chính xác
    const requestedStart = parseLocalDate(booking.returnDate);
    const requestedEnd = parseLocalDate(newReturnDate);

    // Kiểm tra nếu ngày mới chọn lại nhỏ hơn hoặc bằng ngày cũ
    if (requestedEnd <= requestedStart) {
      return res.status(400).json({ error: 'New return date must be after current return date.' });
    }

    const approvedBookings = await Booking.find({
      car: booking.car._id,
      status: 'Approved',
      _id: { $ne: booking._id }
    });

    // 🎯 SỬA TẠI ĐÂY: Dùng hàm parseLocalDate cho đồng bộ để tránh lỗi so sánh
    const conflict = approvedBookings.some((b) =>
      hasOverlap(
        requestedStart, 
        requestedEnd, 
        parseLocalDate(b.pickupDate), 
        parseLocalDate(b.returnDate)
      )
    );

    if (conflict) {
      return res.status(409).json({ error: 'Car already booked by someone else for these extended dates.' });
    }

    // 🎯 SỬA TẠI ĐÂY: Tính toán số ngày phát sinh (Đảm bảo ra số Nguyên, không bị NaN)
    const extraDays = Math.max(1, Math.round((requestedEnd - requestedStart) / 86400000));
    
    // Lấy giá thuê từ schema Xe
    const pricePerDay = booking.car.pricePerDay || 0;
    const extraPrice = extraDays * pricePerDay;

    // Cập nhật lại thông tin vào bản ghi booking
    booking.returnDate = requestedEnd; // Lưu dưới dạng Date object chuẩn
    booking.totalPrice = Number(booking.totalPrice) + Number(extraPrice);

    await booking.save();
    res.json(booking);
  } catch (error) {
    // Nếu có lỗi, in hẳn ra terminal backend để bạn dễ quan sát lý do
    console.error("Error in extendBooking:", error); 
    res.status(500).json({ error: error.message });
  }
};
exports.getAvailabilityCalendar = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: { $in: ['Approved', 'Completed'] } })
      .populate('car', 'name brand imageUrl')
      .select('pickupDate returnDate status car');
    res.json(bookings);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getAvailabilityByCar = async (req, res) => {
  try {
    const bookings = await Booking.find({
      car: req.params.carId,
      status: { $in: ['Pending', 'Approved', 'Completed'] }
    }).select('pickupDate returnDate status');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
