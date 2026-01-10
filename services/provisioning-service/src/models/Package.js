// src/models/Package.js
const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['data', 'voice', 'combo', 'VAS'],
    required: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  validity: {
    type: Number, // in days (0 = ongoing)
    required: true,
    min: 0
  },
  dataQuota: {
    type: mongoose.Schema.Types.Mixed, // number (MB) or "unlimited"
    default: null // optional
  },
  voiceQuota: {
    type: mongoose.Schema.Types.Mixed, // number (minutes) or "unlimited"
    default: null // optional
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Package', packageSchema);