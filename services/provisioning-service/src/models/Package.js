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
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true // adds createdAt/updatedAt (optional)
});

// Create compound index on (type, id) for fast lookups
packageSchema.index({ type: 1, id: 1 });

module.exports = mongoose.model('Package', packageSchema);