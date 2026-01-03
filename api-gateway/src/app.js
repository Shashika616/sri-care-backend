const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const gatewayRoutes = require('./routes/gatewayRoutes');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Gateway routes
app.use('/api', gatewayRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
