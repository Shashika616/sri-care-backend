// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { initiatePayment, confirmPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // optional, use if JWT auth is implemented

// Payment endpoint
router.post('/pay', protect, initiatePayment);
router.post('/confirm', protect, confirmPayment);

module.exports = router;
