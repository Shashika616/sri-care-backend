const Queue = require('bull');
const NotificationLog = require('../models/NotificationLog');
// const { sendToExternalProvider } = require('../services/mockProviders');
const { sendToExternalProvider } = require('../services/realProviders');

// Initialize Redis Queue
// FIX: Added 'maxRetriesPerRequest: null' to prevent the crash
const notifyQueue = new Queue('sricare-notifications', {
    redis: { 
        host: process.env.REDIS_HOST || 'localhost', 
        port: process.env.REDIS_PORT || 6379,
        maxRetriesPerRequest: null, // <--- THIS IS THE CRITICAL FIX
        enableReadyCheck: false
    }
});

// WORKER PROCESS
// This runs in the background. If 10,000 bills come in, this processes them 1 by 1.
notifyQueue.process(async (job) => {
    const { logId, channel, recipient, message } = job.data;

    try {
        // Attempt to send
        await sendToExternalProvider(channel, recipient, message);

        // Update DB on Success
        await NotificationLog.findByIdAndUpdate(logId, {
            status: 'SENT',
            sentAt: new Date()
        });

    } catch (error) {
        // Update DB on Failure
        await NotificationLog.findByIdAndUpdate(logId, {
            status: 'FAILED',
            error: error.message
        });
    }
});

// PRODUCER Helper
const enqueueNotification = async (userId, channel, recipient, message) => {
    console.log(`1. Starting Enqueue for ${channel}...`); // <--- DEBUG 1

    try {
        // 1. Create Audit Log
        const log = await NotificationLog.create({
            userId,
            channel,
            recipient,
            message,
            status: 'QUEUED'
        });
        console.log(`2. MongoDB Log Created: ${log._id}`); // <--- DEBUG 2

        // 2. Add to Redis Queue
        await notifyQueue.add({
            logId: log._id,
            channel,
            recipient,
            message
        });
        console.log(`3. Redis Add Complete`); // <--- DEBUG 3

        console.log(`📥 [Queue] Job added: ${channel} for User ${userId}`);
        
    } catch (error) {
        console.error("❌ ENQUEUE ERROR:", error); // <--- CATCH ERRORS
    }
};

module.exports = { enqueueNotification };