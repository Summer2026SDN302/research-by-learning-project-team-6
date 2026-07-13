const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'model'], required: true },
  parts: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
