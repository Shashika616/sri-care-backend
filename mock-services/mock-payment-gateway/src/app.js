const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const gatewayRoutes = require('./routes/gatewayRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Mock Payment Gateway is running' });
});

// Gateway routes
app.use('/api/gateway', gatewayRoutes);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Mock Payment Gateway running on port ${PORT}`));
