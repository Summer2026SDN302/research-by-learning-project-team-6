const SellerRequest = require('../models/SellerRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

const sendNotification = async ({ userId, title, body, type = 'system' }) => {
  try {
    await Notification.create({ user: userId, title, body, type });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

exports.listPendingSellerRequests = async (req, res) => {
  try {
    const requests = await SellerRequest.find({ status: 'PENDING' })
      .populate('user', 'name email role createdAt')
      .sort({ created_at: -1 });

    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load seller requests', error: error.message });
  }
};

exports.reviewSellerRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['APPROVED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (status === 'DECLINED' && !reason?.trim()) {
      return res.status(400).json({ message: 'Decline reason is required' });
    }

    const request = await SellerRequest.findById(id).populate('user', 'name email role');
    if (!request) {
      return res.status(404).json({ message: 'Seller request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(409).json({ message: 'This seller request has already been reviewed' });
    }

    request.status = status;
    request.rejected_reason = status === 'DECLINED' ? reason.trim() : '';
    request.updated_at = new Date();
    request.updated_by = req.user.id;
    await request.save();

    if (status === 'APPROVED') {
      await User.findByIdAndUpdate(request.user._id, { role: 'seller' });
      await sendNotification({
        userId: request.user._id,
        title: 'Seller request approved',
        body: 'Your request to become a seller has been approved.',
        type: 'system',
      });

      return res.json({
        message: 'Seller request approved successfully',
        request,
      });
    }

    await sendNotification({
      userId: request.user._id,
      title: 'Seller request declined',
      body: `Your request to become a seller was declined. Reason: ${reason.trim()}`,
      type: 'system',
    });

    return res.json({
      message: 'Seller request declined successfully',
      request,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to review seller request', error: error.message });
  }
};
