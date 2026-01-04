require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const connectRabbitMQ = require('./consumers/eventConsumer');

const app = express();
app.use(express.json());

// Initialize Services
connectDB();       // 1. Database
connectRabbitMQ(); // 2. Event Bus Listener

// Health Check Endpoint (Required for Kubernetes/Docker)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Notification-Service' });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`🚀 Notification Service running on Port ${PORT}`);
});