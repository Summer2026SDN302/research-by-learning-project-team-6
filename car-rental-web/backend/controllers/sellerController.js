const SellerRequest = require('../models/SellerRequest');
const User = require('../models/User');

exports.submitRequest = async (req, res) => {
  try {
    const { fullName, idCardImage, agreedToTerms } = req.body;
    
    if (!agreedToTerms) {
      return res.status(400).json({ message: 'You must agree to the terms and conditions' });
    }

    const existingRequest = await SellerRequest.findOne({ user: req.user.id });
    if (existingRequest && existingRequest.status !== 'Rejected') {
      return res.status(400).json({ message: 'You already have a pending or approved request' });
    }

    const request = new SellerRequest({
      user: req.user.id,
      fullName,
      idCardImage,
      agreedToTerms
    });

    await request.save();
    res.status(201).json({ message: 'Seller request submitted successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyRequestStatus = async (req, res) => {
  try {
    const request = await SellerRequest.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!request) {
      return res.status(404).json({ message: 'No request found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await SellerRequest.find().populate('user', 'name email');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reviewRequest = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const request = await SellerRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    if (adminNotes) request.adminNotes = adminNotes;
    await request.save();

    if (status === 'Approved') {
      await User.findByIdAndUpdate(request.user, { role: 'seller' });
    } else if (status === 'Rejected') {
      await User.findByIdAndUpdate(request.user, { role: 'customer' }); // downgrade just in case
    }

    res.json({ message: `Request ${status.toLowerCase()}`, request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
