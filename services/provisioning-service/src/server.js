// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Optional but recommended
const connectDB = require('./config/db');

// Import routes
const packageRoutes = require('./routes/packageRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5004;

// Middleware
app.use(cors()); // Enable CORS for frontend access
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/packages', packageRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Provisioning service running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/packages`);
});