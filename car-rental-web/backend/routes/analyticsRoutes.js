const express = require('express');
const {
    seedTestData,
    getBookingStatistics,
    getDashboardStats,
    getBookingTrends,
    getTopCars,
    getCarTypeDistribution,
    getRevenueByType,
    getLocationAnalytics,
    getPricingSurge,
    getSurgeAvailability,
    getDemandForecast,
    getPriceOptimization
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
router.get('/pricing-surge', protect, adminOnly, getPricingSurge);
router.get('/surge-availability', protect, adminOnly, getSurgeAvailability);
router.get('/demand-forecast', protect, adminOnly, getDemandForecast);
router.get('/price-optimization', protect, adminOnly, getPriceOptimization);

module.exports = router;
