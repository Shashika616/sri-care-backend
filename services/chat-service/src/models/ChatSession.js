const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    // required: true
  },
  agentId: {
    type: String,
    default: null
  },
  agentName: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'closed', 'transferred'],
    default: 'waiting'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date,
    default: null
  },
  closeReason: {
    type: String,
    enum: ['resolved', 'timeout', 'agent_closed', 'customer_left'],
    default: null
  }
});

chatSessionSchema.index({ status: 1, lastActivityAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);