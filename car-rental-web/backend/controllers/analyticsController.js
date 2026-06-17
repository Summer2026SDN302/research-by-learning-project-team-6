const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Review = require('../models/Review');
const User = require('../models/User');

// Seed test data (Admin only)
exports.seedTestData = async (req, res) => {
    try {
        // Create test users
        const users = await User.create([
            {
                name: 'John Doe',
                email: `john${Date.now()}@example.com`,
                password: 'hashedpassword123',
                role: 'customer',
                isVerified: true
            },
            {
                name: 'Jane Smith',
                email: `jane${Date.now()}@example.com`,
                password: 'hashedpassword456',
                role: 'customer',
                isVerified: true
            }
        ]);

        // Create test cars
        const cars = await Car.create([
            {
                name: 'Tesla Model 3',
                brand: 'Tesla',
                model: 'Model 3',
                year: 2024,
                pricePerDay: 150,
                type: 'Sedan',
                description: 'Luxury electric sedan',
                location: 'Hanoi',
                seats: 5,
                transmission: 'Auto',
                fuelType: 'Electric',
                imageUrl: 'https://via.placeholder.com/400?text=Tesla+Model+3',
                availability: true,
                rating: 4.8
            },
            {
                name: 'BMW X5',
                brand: 'BMW',
                model: 'X5',
                year: 2023,
                pricePerDay: 200,
                type: 'SUV',
                description: 'Premium SUV with advanced features',
                location: 'Hanoi',
                seats: 7,
                transmission: 'Auto',
                fuelType: 'Gas',
                imageUrl: 'https://via.placeholder.com/400?text=BMW+X5',
                availability: true,
                rating: 4.9
            },
            {
                name: 'Toyota Corolla',
                brand: 'Toyota',
                model: 'Corolla',
                year: 2023,
                pricePerDay: 80,
                type: 'Sedan',
                description: 'Reliable and economical',
                location: 'Hanoi',
                seats: 5,
                transmission: 'Auto',
                fuelType: 'Gas',
                imageUrl: 'https://via.placeholder.com/400?text=Toyota+Corolla',
                availability: true,
                rating: 4.5
            },
            {
                name: 'Honda Civic',
                brand: 'Honda',
                model: 'Civic',
                year: 2023,
                pricePerDay: 85,
                type: 'Sedan',
                description: 'Sporty and fuel efficient',
                location: 'Ho Chi Minh',
                seats: 5,
                transmission: 'Manual',
                fuelType: 'Gas',
                imageUrl: 'https://via.placeholder.com/400?text=Honda+Civic',
                availability: true,
                rating: 4.6
            }
        ]);

        // Create test bookings with varied data
        const bookings = [];
        const startDate = new Date(2024, 0, 1);

        for (let i = 0; i < 30; i++) {
            const pickupDate = new Date(startDate);
            pickupDate.setDate(pickupDate.getDate() + Math.floor(Math.random() * 150));

            const returnDate = new Date(pickupDate);
            returnDate.setDate(returnDate.getDate() + Math.floor(Math.random() * 7) + 1);

            const car = cars[Math.floor(Math.random() * cars.length)];
            const user = users[Math.floor(Math.random() * users.length)];
            const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
            const distance = Math.floor(Math.random() * 500) + 100;
            const totalPrice = (car.pricePerDay * days) + (distance * 0.5);

            bookings.push({
                user: user._id,
                car: car._id,
                pickupDate,
                returnDate,
                pickupLocation: car.location,
                distanceKm: distance,
                addOns: Math.random() > 0.5 ? ['insurance', 'gps'] : ['insurance'],
                paymentStatus: Math.random() > 0.1 ? 'paid' : 'pending',
                totalPrice,
                customerName: user.name,
                customerEmail: user.email,
                customerPhone: '+84' + Math.floor(Math.random() * 9000000000 + 1000000000),
                status: ['Completed', 'Approved', 'Pending'][Math.floor(Math.random() * 3)],
                lateFee: Math.random() > 0.8 ? Math.floor(Math.random() * 50) : 0
            });
        }

        const createdBookings = await Booking.create(bookings);

        res.json({
            message: 'Test data created successfully!',
            usersCreated: users.length,
            carsCreated: cars.length,
            bookingsCreated: createdBookings.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get booking statistics (Admin only)
exports.getBookingStatistics = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();

        const bookingsByStatus = await Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const revenueData = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' }
                }
            }
        ]);

        const monthlyRevenue = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);

        const avgBookingValue = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: '$totalPrice' }
                }
            }
        ]);

        const cancellationStats = await Booking.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    cancelled: {
                        $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    cancellationRate: {
                        $multiply: [
                            { $divide: ['$cancelled', '$total'] },
                            100
                        ]
                    }
                }
            }
        ]);

        res.json({
            totalBookings,
            bookingsByStatus,
            totalRevenue: revenueData[0]?.totalRevenue || 0,
            monthlyRevenue,
            avgBookingValue: avgBookingValue[0]?.avgPrice || 0,
            cancellationRate: cancellationStats[0]?.cancellationRate || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get dashboard statistics (Admin only)
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'Active' });
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
        const totalCars = await Car.countDocuments();
        const totalBookings = await Booking.countDocuments();

        const revenueData = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' }
                }
            }
        ]);
        const revenue = revenueData[0]?.totalRevenue || 0;

        const monthlyRevenueData = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);

        const monthlyRevenue = {};
        monthlyRevenueData.forEach(item => {
            const key = `${item._id.year}-${item._id.month}`;
            monthlyRevenue[key] = item.revenue;
        });

        const bookingsByLocationData = await Booking.aggregate([
            {
                $group: {
                    _id: '$pickupLocation',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const bookingsByLocation = {};
        bookingsByLocationData.forEach(item => {
            bookingsByLocation[item._id || 'Unknown'] = item.count;
        });

        const bookingStatusStatsData = await Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const bookingStatusStats = {
            Pending: 0,
            Approved: 0,
            Completed: 0,
            Cancelled: 0
        };

        bookingStatusStatsData.forEach(item => {
            const status = item._id || 'Pending';
            if (bookingStatusStats.hasOwnProperty(status)) {
                bookingStatusStats[status] = item.count;
            }
        });

        res.json({
            totalUsers,
            activeUsers,
            newUsersThisMonth,
            totalCars,
            totalBookings,
            revenue,
            monthlyRevenue,
            bookingsByLocation,
            bookingStatusStats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get booking trends (Admin only)
exports.getBookingTrends = async (req, res) => {
    try {
        const { period = 'daily' } = req.query;

        let groupBy;
        if (period === 'daily') {
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
        } else if (period === 'weekly') {
            groupBy = {
                year: { $year: '$createdAt' },
                week: { $week: '$createdAt' }
            };
        } else {
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };
        }

        const trends = await Booking.aggregate([
            {
                $group: {
                    _id: groupBy,
                    bookingCount: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' },
                    avgPrice: { $avg: '$totalPrice' }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
        ]);

        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get top performing cars (Admin only)
exports.getTopCars = async (req, res) => {
    try {
        const topCars = await Booking.aggregate([
            {
                $group: {
                    _id: '$car',
                    bookingCount: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' },
                    avgPrice: { $avg: '$totalPrice' }
                }
            },
            { $sort: { bookingCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'cars',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'carDetails'
                }
            },
            { $unwind: '$carDetails' }
        ]);

        res.json(topCars);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get car type distribution (Admin only)
exports.getCarTypeDistribution = async (req, res) => {
    try {
        const distribution = await Booking.aggregate([
            {
                $lookup: {
                    from: 'cars',
                    localField: 'car',
                    foreignField: '_id',
                    as: 'carInfo'
                }
            },
            { $unwind: '$carInfo' },
            {
                $group: {
                    _id: '$carInfo.type',
                    bookingCount: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' },
                    avgRating: { $avg: '$carInfo.rating' }
                }
            },
            { $sort: { bookingCount: -1 } }
        ]);

        res.json(distribution);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get revenue by type (Admin only)
exports.getRevenueByType = async (req, res) => {
    try {
        const revenueByType = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $lookup: {
                    from: 'cars',
                    localField: 'car',
                    foreignField: '_id',
                    as: 'carInfo'
                }
            },
            { $unwind: '$carInfo' },
            {
                $group: {
                    _id: '$carInfo.type',
                    totalRevenue: { $sum: '$totalPrice' },
                    bookingCount: { $sum: 1 },
                    avgBookingValue: { $avg: '$totalPrice' }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        res.json(revenueByType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get location analytics (Admin only)
exports.getLocationAnalytics = async (req, res) => {
    try {
        const locationAnalytics = await Booking.aggregate([
            {
                $group: {
                    _id: '$pickupLocation',
                    bookingCount: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' },
                    avgDistance: { $avg: '$distanceKm' }
                }
            },
            { $sort: { bookingCount: -1 } }
        ]);

        res.json(locationAnalytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get pricing surge data (Admin only)
exports.getPricingSurge = async (req, res) => {
    try {
        const surgeData = await Booking.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$pickupDate' },
                        month: { $month: '$pickupDate' },
                        day: { $dayOfMonth: '$pickupDate' }
                    },
                    bookingCount: { $sum: 1 },
                    avgPrice: { $avg: '$totalPrice' },
                    maxPrice: { $max: '$totalPrice' },
                    minPrice: { $min: '$totalPrice' },
                    totalRevenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
            { $limit: 90 }
        ]);

        const avgBookings = await Booking.countDocuments();
        const avgPerDay = avgBookings / 30;

        const surgePeriods = surgeData.filter(day => day.bookingCount > avgPerDay * 1.5);

        res.json({
            surgeData,
            surgePeriods,
            averageBookingsPerDay: avgPerDay.toFixed(2),
            highDemandThreshold: (avgPerDay * 1.5).toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get surge availability (Admin only)
exports.getSurgeAvailability = async (req, res) => {
    try {
        const surgeAnalysis = await Booking.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$pickupDate' },
                        month: { $month: '$pickupDate' },
                        day: { $dayOfMonth: '$pickupDate' }
                    },
                    bookingCount: { $sum: 1 }
                }
            },
            { $sort: { bookingCount: -1 } },
            { $limit: 10 }
        ]);

        const totalCars = await Car.countDocuments();

        const availabilityData = await Promise.all(
            surgeAnalysis.map(async (surge) => {
                const carsBooked = await Booking.distinct('car', {
                    pickupDate: {
                        $gte: new Date(`${surge._id.year}-${surge._id.month}-${surge._id.day}`),
                        $lt: new Date(`${surge._id.year}-${surge._id.month}-${surge._id.day + 1}`)
                    }
                });

                return {
                    date: `${surge._id.year}-${surge._id.month}-${surge._id.day}`,
                    bookings: surge.bookingCount,
                    carsBooked: carsBooked.length,
                    carsAvailable: totalCars - carsBooked.length,
                    utilizationRate: ((carsBooked.length / totalCars) * 100).toFixed(2)
                };
            })
        );

        res.json(availabilityData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get demand forecast (Admin only)
exports.getDemandForecast = async (req, res) => {
    try {
        const historicalData = await Booking.aggregate([
            {
                $group: {
                    _id: {
                        dayOfWeek: { $dayOfWeek: '$pickupDate' },
                        month: { $month: '$pickupDate' }
                    },
                    avgBookings: { $avg: 1 },
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$totalPrice' }
                }
            },
            { $sort: { '_id.month': 1, '_id.dayOfWeek': 1 } }
        ]);

        const forecast = historicalData.map(item => ({
            dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][item._id.dayOfWeek],
            month: item._id.month,
            expectedBookings: item.count,
            recommendedPrice: (item.avgPrice * (1 + (item.count - 3) * 0.1)).toFixed(2),
            demandLevel: item.count > 5 ? 'High' : item.count > 2 ? 'Medium' : 'Low'
        }));

        res.json(forecast);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get price optimization (Admin only)
exports.getPriceOptimization = async (req, res) => {
    try {
        const suggestions = await Booking.aggregate([
            {
                $group: {
                    _id: '$car',
                    bookingCount: { $sum: 1 },
                    avgPrice: { $avg: '$totalPrice' },
                    maxPrice: { $max: '$totalPrice' },
                    minPrice: { $min: '$totalPrice' },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            {
                $lookup: {
                    from: 'cars',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'carInfo'
                }
            },
            { $unwind: '$carInfo' },
            {
                $project: {
                    carName: '$carInfo.name',
                    brand: '$carInfo.brand',
                    model: '$carInfo.model',
                    imageUrl: '$carInfo.imageUrl',
                    currentPrice: '$carInfo.pricePerDay',
                    bookingCount: 1,
                    avgPrice: 1,
                    revenue: 1,
                    suggestion: {
                        $cond: [
                            { $gt: ['$bookingCount', 8] },
                            { action: 'Increase Price', reason: 'High Demand' },
                            {
                                $cond: [
                                    { $lt: ['$bookingCount', 2] },
                                    { action: 'Decrease Price', reason: 'Low Demand' },
                                    { action: 'Maintain Price', reason: 'Stable Demand' }
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
