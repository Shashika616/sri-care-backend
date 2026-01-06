// src/routes/billingRoutes.js
const express = require('express');
const router = express.Router();
const { getUserBills, generateBill, markBillPaid } = require('../controllers/billingController');
const { protect, internalOnly } = require('../middleware/authMiddleware');

// User-facing endpoints (JWT or gateway calls)
router.get('/', protect, getUserBills);          // User gets their bills
router.post('/generate', protect, generateBill); // Generate a bill

// Internal-only endpoint (gateway calls only)
router.post('/mark-paid', markBillPaid);

module.exports = router;