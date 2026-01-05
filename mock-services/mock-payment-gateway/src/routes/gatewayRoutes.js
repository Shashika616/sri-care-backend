// src/routes/gatewayRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Payment Gateway endpoint
router.post('/pay', async (req, res) => {
  const { amount, cardNumber, expiry, cvv, userId, billId, purpose } = req.body;

  if (!amount || !cardNumber || !expiry || !cvv || !userId || !purpose) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Generate a unique providerRef for this transaction
    const providerRef = `BANK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Forward payment request to Bank Service
    const bankResponse = await axios.post(`${process.env.BANK_URL}/bank/validate-card`, {
      amount,
      cardNumber,
      expiry,
      cvv,
      providerRef, // now defined
    });

    // Return the response to Payment Service
    res.status(200).json({
      status: 'PENDING',           // OTP verification needed
      transactionRef: bankResponse.data.transactionRef,
      otpSent: true,                // OTP triggered
      message: 'OTP sent to user',
    });
  } catch (err) {
    console.error('Bank validation failed:', err.message);
    res.status(402).json({
      status: 'FAILED',
      transactionRef: `GATEWAY-${Date.now()}`,
      message: 'Payment declined',
    });
  }
});


router.post('/verify-otp', async (req, res) => {
  const { providerRef, otp } = req.body;

  if (!providerRef || !otp) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Forward OTP verification to Bank
    const bankResponse = await axios.post(
      `${process.env.BANK_URL}/bank/verify-otp`,
      { providerRef, otp }
    );

    return res.status(200).json({
      status: bankResponse.data.status,
      transactionRef: bankResponse.data.transactionRef,
      message: bankResponse.data.message
    });

  } catch (err) {
      const data = err.response?.data;

      return res.status(err.response?.status || 400).json({
        status: data?.status || 'INVALID_OTP',
        message: data?.message || 'Invalid OTP',
        attemptsLeft: data?.attemptsLeft
      });
    }
});

router.post('/rollback', async (req, res) => {
  const { providerRef, amount } = req.body;

  if (!providerRef || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Forward rollback request to Bank
    const bankResponse = await axios.post(
      `${process.env.BANK_URL}/bank/rollback`,
      { providerRef, amount }
    );

    return res.status(200).json({
      status: bankResponse.data.status,
      message: bankResponse.data.message,
      transactionRef: providerRef
    });

  } catch (err) {
    console.error('Rollback failed:', err.message);
    return res.status(500).json({
      status: 'FAILED',
      message: 'Rollback failed at gateway'
    });
  }
});


module.exports = router;
