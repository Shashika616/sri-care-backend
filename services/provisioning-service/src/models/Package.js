// src/models/Package.js
const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['data', 'voice', 'VAS'],
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
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

// No index on 'id' — we're not using it
module.exports = mongoose.model('Package', packageSchema);