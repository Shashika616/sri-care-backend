dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const connectDB = require('./config/db');
const billingRoutes = require('./routes/billingRoutes');
const billingEmitter = require('./events/eventEmitter');



connectDB();

const app = express();
app.use(express.json());

// Routes
app.use('/api/billing', billingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Billing Service running' });
});

// Listen to emitted events (for debugging / Notification Service)
billingEmitter.on('billGenerated', (data) => {
  console.log('Event emitted: billGenerated', data);
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Billing Service running on port ${PORT}`));
