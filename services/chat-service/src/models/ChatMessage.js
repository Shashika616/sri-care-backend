const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    roomId: { type: String, required: true }, // Unique ID for the conversation (e.g., "customer_123")
    sender: { type: String, enum: ['CUSTOMER', 'AGENT'], required: true },
    senderId: { type: String, required: true }, // "user_123" or "agent_007"
    message: { type: String, required: true },
    readBy: [{ type: String }], // Optional: To track read receipts
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);