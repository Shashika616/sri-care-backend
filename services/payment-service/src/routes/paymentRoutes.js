// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { initiatePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // optional, use if JWT auth is implemented

// Payment endpoint
router.post('/pay', protect, initiatePayment);

module.exports = router;
