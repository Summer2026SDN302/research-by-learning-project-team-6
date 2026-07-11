const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/request', protect, sellerController.submitRequest);
router.get('/request/me', protect, sellerController.getMyRequestStatus);
router.get('/requests', protect, adminOnly, sellerController.getAllRequests);
router.patch('/requests/:id', protect, adminOnly, sellerController.reviewRequest);

module.exports = router;
