const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => {
  res.json({ status: 'Payment Service is running' });
});

// Routes
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
