// services/provisioning-service/src/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT TO MOCK SERVER
const MOCK_URL = process.env.MOCK_URL || "http://localhost:4000/api";

// 1. Balance Wrapper
app.get('/provision/balance/:phone', async (req, res) => {
    try {
        const response = await axios.get(`${MOCK_URL}/balance/${req.params.phone}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Telco Network Unreachable" });
    }
});

// 2. Reload Wrapper
app.post('/provision/reload', async (req, res) => {
    try {
        const response = await axios.post(`${MOCK_URL}/reload`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Reload Failed" });
    }
});

// 3. Package Wrapper
app.post('/provision/package', async (req, res) => {
    try {
        const response = await axios.post(`${MOCK_URL}/package`, req.body);
        res.json(response.data);
    } catch (error) {
        if (error.response) res.status(error.response.status).json(error.response.data);
        else res.status(500).json({ error: "Activation Failed" });
    }
});

// 4. Roaming Wrapper
app.post('/provision/roaming', async (req, res) => {
    try {
        const response = await axios.post(`${MOCK_URL}/roaming`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Roaming Failed" });
    }
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
    console.log(`⚙️  Provisioning Service running on Port ${PORT}`);
});