const mongoose = require('mongoose');

const SellerRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'DECLINED'],
    default: 'PENDING',
    index: true,
  },
  rejected_reason: { type: String, default: '' },
  updated_at: { type: Date, default: null },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('SellerRequest', SellerRequestSchema);
