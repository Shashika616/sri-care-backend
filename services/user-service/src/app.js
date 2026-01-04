const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');
const walletRoutes = require('./routes/walletRoutes');

dotenv.config();

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', authRoutes);
app.use('/api/wallet', walletRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'User Service running' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
