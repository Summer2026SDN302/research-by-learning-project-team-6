const mongoose = require('mongoose');

const PricingSurgeSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  multiplier: { type: Number, required: true, min: 0.1 }, // e.g. 1.5 = +50% surge
  reason: { type: String, required: true },               // e.g. "Formula 1 Weekend"
  startDate: { type: String, required: true },            // YYYY-MM-DD
  endDate: { type: String, required: true },              // YYYY-MM-DD
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('PricingSurge', PricingSurgeSchema);
