const express = require('express');
const { getAllCars, getCarById, createCar, updateCar, deleteCar } = require('../controllers/carController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', getAllCars);
router.get('/:id', getCarById);

// Admin
router.post('/', protect, adminOnly, createCar);
router.put('/:id', protect, adminOnly, updateCar);
router.delete('/:id', protect, adminOnly, deleteCar);

module.exports = router;
