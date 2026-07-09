const Review = require('../models/Review');
const Booking = require('../models/Booking');

exports.getAllReviews = async (req, res) => {
    try {
        const query = {};
        if (req.query.car) {
            query.car = req.query.car;
        }
        const reviews = await Review.find(query)
            .populate('user', 'name email role')
            .populate('car', 'name brand model imageUrl');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('user', 'name email role')
            .populate('car', 'name brand model imageUrl');
        if (!review) return res.status(404).json({ error: 'Review not found' });
        res.json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { car, booking, rating, comment } = req.body;
        const userId = req.user.id;

        const bookingDoc = await Booking.findById(booking);
        if (!bookingDoc) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (bookingDoc.user.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized to review this booking' });
        }

        if (bookingDoc.status !== 'Completed') {
            return res.status(400).json({ error: 'Cannot review an incomplete booking' });
        }

        if (bookingDoc.car.toString() !== car) {
            return res.status(400).json({ error: 'Booking car mismatch' });
        }

        const existingReview = await Review.findOne({ booking });
        if (existingReview) {
            return res.status(400).json({ error: 'This booking has already been reviewed' });
        }

        const newReview = new Review({
            user: userId,
            car,
            booking,
            rating,
            comment
        });

        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to edit this review' });
        }

        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedReview);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to delete this review' });
        }

        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
