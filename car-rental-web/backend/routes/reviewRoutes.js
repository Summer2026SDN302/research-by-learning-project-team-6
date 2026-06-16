const express = require('express');
const { getAllReviews, getReviewById, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/:id', getReviewById);
router.post('/', createReview);

// Admin
router.get('/', protect, adminOnly, getAllReviews);
router.put('/:id', protect, adminOnly, updateReview);
router.delete('/:id', protect, adminOnly, deleteReview);

module.exports = router;
