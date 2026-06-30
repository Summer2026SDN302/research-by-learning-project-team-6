const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getCommissionSummary,
  getPricingSurges,
  getAllPricingSurges,
  createPricingSurge,
  updatePricingSurge,
  deletePricingSurge,
  getCarsTimeline,
  getCalendarOccupancy
} = require('../controllers/adminController');
const { listPendingSellerRequests, reviewSellerRequest } = require('../controllers/sellerRequestController');

router.get('/commissions', protect, adminOnly, getCommissionSummary);
router.get('/seller-requests', protect, adminOnly, listPendingSellerRequests);
router.put('/seller-requests/:id/review', protect, adminOnly, reviewSellerRequest);

module.exports = router;
