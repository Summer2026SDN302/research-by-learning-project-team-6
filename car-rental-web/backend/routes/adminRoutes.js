const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getPricingSurges,
  getAllPricingSurges,
  createPricingSurge,
  updatePricingSurge,
  deletePricingSurge,
  getCarsTimeline,
  getCalendarOccupancy
} = require('../controllers/adminController');

router.get('/vouchers', protect, adminOnly, getVouchers);
router.post('/vouchers', protect, adminOnly, createVoucher);
router.put('/vouchers/:id', protect, adminOnly, updateVoucher);
router.delete('/vouchers/:id', protect, adminOnly, deleteVoucher);

router.get('/pricing-surges', protect, adminOnly, getPricingSurges);
router.get('/pricing-surges/all', protect, adminOnly, getAllPricingSurges);
router.post('/pricing-surges', protect, adminOnly, createPricingSurge);
router.put('/pricing-surges/:id', protect, adminOnly, updatePricingSurge);
router.delete('/pricing-surges/:id', protect, adminOnly, deletePricingSurge);

router.get('/cars-timeline', protect, adminOnly, getCarsTimeline);
router.get('/calendar-occupancy', protect, adminOnly, getCalendarOccupancy);

module.exports = router;
