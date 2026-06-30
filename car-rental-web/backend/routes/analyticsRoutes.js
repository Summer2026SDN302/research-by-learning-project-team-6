const express = require('express');
const {
    seedTestData,
    getBookingStatistics,
    getDashboardStats,
    getBookingTrends,
    getTopCars,
    getCarTypeDistribution,
    getRevenueByType,
    getLocationAnalytics
} = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All analytics endpoints are admin-only
router.post('/seed-test-data', protect, adminOnly, seedTestData);
router.get('/booking-statistics', protect, adminOnly, getBookingStatistics);
router.get('/dashboard-stats', protect, adminOnly, getDashboardStats);
router.get('/booking-trends', protect, adminOnly, getBookingTrends);
router.get('/top-cars', protect, adminOnly, getTopCars);
router.get('/car-type-distribution', protect, adminOnly, getCarTypeDistribution);
router.get('/revenue-by-type', protect, adminOnly, getRevenueByType);
router.get('/analytics-by-location', protect, adminOnly, getLocationAnalytics);

module.exports = router;
