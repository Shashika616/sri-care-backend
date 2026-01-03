const mongoose = require('mongoose');

const NotificationLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    channel: { type: String, enum: ['EMAIL', 'SMS', 'PUSH'], required: true },
    recipient: { type: String, required: true }, // The email address or phone number
    message: { type: String, required: true },
    status: { type: String, enum: ['QUEUED', 'SENT', 'FAILED'], default: 'QUEUED' },
    error: { type: String }, // Stores failure reason if any
    sentAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);