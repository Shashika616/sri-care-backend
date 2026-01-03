// src/controllers/paymentController.js
const Transaction = require('../models/transactionModel');
const axios = require('axios');

// Mock Payment Gateway
const mockPaymentGateway = async (amount, cardInfo) => {
  try {
    const response = await axios.post(`${process.env.GATEWAY_URL}/api/gateway/pay`, {
      amount,
      ...cardInfo, // cardNumber, expiry, cvv
    });

    return {
      status: response.data.status,
      providerRef: response.data.transactionRef,
    };
  } catch (err) {
    return {
      status: 'FAILED',
      providerRef: `mock_${Date.now()}`,
    };
  }
};

// @desc Initiate payment
// @route POST /api/payments/pay
// @access Private
const initiatePayment = async (req, res) => {
  const { billId, amount, purpose, cardNumber, expiry, cvv } = req.body;
  const userId = req.userId; // trusted from gateway

  // Validate purpose
  if (!purpose || !['BILL_PAYMENT', 'TOP_UP'].includes(purpose)) {
    return res.status(400).json({ message: 'Invalid or missing purpose' });
  }

  if (!userId || !amount || !cardNumber || !expiry || !cvv) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Call mock gateway
  const paymentResult = await mockPaymentGateway(amount, { cardNumber, expiry, cvv });

  // Save transaction
  const transaction = await Transaction.create({
    userId,
    billId,
    amount,
    purpose,
    status: paymentResult.status,
    providerRef: paymentResult.providerRef,
  });

  // Emit event (just console log here)
  console.log('Event emitted: billPaid', {
    billId,
    userId,
    amount,
    status: transaction.status,
  });

  res.status(201).json({
    message: `Payment ${transaction.status}`,
    transaction,
  });
};

module.exports = { initiatePayment };
