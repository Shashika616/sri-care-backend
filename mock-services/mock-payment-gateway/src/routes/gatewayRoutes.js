const express = require('express');
const router = express.Router();

// Mock payment endpoint
// Expects: POST /api/gateway/pay
// Body: { amount: Number, cardNumber: String, expiry: String, cvv: String }
router.post('/pay', (req, res) => {
  const { amount, cardNumber, expiry, cvv } = req.body;

  if (!amount || !cardNumber || !expiry || !cvv) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Simulate random success/failure
  const isSuccess = Math.random() > 0.1; // 90% success rate
  const transactionRef = `MOCK-${Date.now()}`;

  if (isSuccess) {
    return res.status(200).json({
      status: 'SUCCESS',
      transactionRef,
      message: 'Payment processed successfully',
    });
  } else {
    return res.status(402).json({
      status: 'FAILED',
      transactionRef,
      message: 'Payment declined by bank',
    });
  }
});

module.exports = router;
