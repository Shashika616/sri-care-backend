const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['customer', 'agent', 'system'],
    required: true
  },
  recipientId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  }
});

chatMessageSchema.index({ roomId: 1, timestamp: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
