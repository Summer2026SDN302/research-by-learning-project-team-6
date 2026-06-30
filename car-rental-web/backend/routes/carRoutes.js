const express = require('express');
const jwt = require('jsonwebtoken');
const Car = require('../models/Car');
const { getDynamicPricing } = require('../controllers/carController');
const router = express.Router();

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            req.user = null;
        }
    }
    next();
};

const restrictAdminMutations = (req, res, next) => {
    if (req.user?.role === 'admin' && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return res.status(403).json({ message: 'Admin access to cars is read-only' });
    }
    next();
};

router.use(optionalAuth);
router.use(restrictAdminMutations);

// Public
router.get('/', async (req, res) => {
    try {
        const { brand, type, search, lat, lng, radius } = req.query;
        const query = {};
        
        if (brand) {
            query.brand = brand;
        }
        if (type) {
            query.type = type;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (lat && lng) {
            const radiusInMeters = (parseFloat(radius) || 10) * 1000;
            query.locationGeo = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radiusInMeters
                }
            };
        }

        const cars = await Car.find(query);
        res.json(cars);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get car by ID
router.get('/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ error: 'Car not found' });
        res.json(car);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create car
router.post('/', async (req, res) => {
    try {
        const newCar = new Car(req.body);
        const savedCar = await newCar.save();
        res.status(201).json(savedCar);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update car
router.put('/:id', async (req, res) => {
    try {
        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedCar);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete car
router.delete('/:id', async (req, res) => {
    try {
        await Car.findByIdAndDelete(req.params.id);
        res.json({ message: 'Car deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/:id/pricing', getDynamicPricing);

module.exports = router;
