const express = require('express');
const cors = require('cors');
const telcoRoutes = require('./routes/telcoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Startup Banner
console.log("-----------------------------------------");
console.log("📡 SMART TELCO NETWORK STARTED");
console.log("-----------------------------------------");

// Use the routes with /api prefix
app.use('/api', telcoRoutes);

// Start the server
app.listen(4002, () => {
    console.log('✅ Mock Telco running on: http://localhost:4002');
});