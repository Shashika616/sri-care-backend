const express = require('express');
const router = express.Router();
const { getUserBills, generateBill, markBillPaid } = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

// Get all bills for logged-in user
router.get('/', protect, getUserBills);

// Generate a new bill (could be called by admin/provisioning)
// In production, could be triggered by cron job
router.post('/generate', protect, generateBill);

router.post('/mark-paid', markBillPaid);

module.exports = router;
