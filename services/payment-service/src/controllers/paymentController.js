// src/controllers/paymentController.js
const Transaction = require('../models/transactionModel');
const axios = require('axios');

// Mock Payment Gateway helper 
const mockPaymentGateway = async (amount, cardInfo) => {
  try {
    const response = await axios.post(`${process.env.GATEWAY_URL}/api/gateway/pay`, {
      amount,
      ...cardInfo, // cardNumber, expiry, cvv, userId, billId, purpose
    });

    return {
      status: response.data.status,
      providerRef: response.data.transactionRef,
      otpSent: response.data.otpSent || false, // whether OTP was triggered
    };
  } catch (err) {
    console.error('Payment Gateway error:', err.message);
    return {
      status: 'FAILED',
      providerRef: `mock_${Date.now()}`,
      otpSent: false,
    };
  }
};

// Existing initiatePayment 
const initiatePayment = async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  const { billId, amount, cardNumber, expiry, cvv, purpose } = req.body;
  const userId = req.userId;

  if (!idempotencyKey) {
    return res.status(400).json({ message: 'Idempotency-Key header required' });
  }

  if (!userId || !amount || !cardNumber || !expiry || !cvv || !purpose) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const existingTxn = await Transaction.findOne({ idempotencyKey });
  if (existingTxn) {
    return res.status(200).json({
      message: 'Duplicate request – returning existing transaction',
      transaction: existingTxn,
    });
  }

  try {
    const gatewayResponse = await mockPaymentGateway(amount, {
      userId,
      billId,
      cardNumber,
      expiry,
      cvv,
      purpose,
    });

    const transaction = await Transaction.create({
      userId,
      billId: billId || null,
      cardNumber,
      amount,
      purpose,
      status: gatewayResponse.status || 'PENDING',
      idempotencyKey,
      providerRef: gatewayResponse.providerRef,
    });

    res.status(201).json({
      message: `Payment ${gatewayResponse.status}`,
      transaction,
      otpSent: gatewayResponse.otpSent,
    });
  } catch (err) {
    console.error('Payment error:', err.message);
    const transaction = await Transaction.create({
      userId,
      billId: billId || null,
      amount,
      purpose,
      status: 'FAILED',
      providerRef: `mock_${Date.now()}`,
    });

    res.status(500).json({
      message: 'Payment FAILED',
      transaction,
    });
  }
};


const confirmPayment = async (req, res) => {
  const { providerRef, otp } = req.body;

  const txn = await Transaction.findOne({
    providerRef,
  });

  if (!txn) {
    return res.status(400).json({ message: 'Invalid transaction' });
  }

  // Idempotency guard
  if (txn.status !== 'PENDING') {
    return res.json({ message: 'Already processed', transaction: txn });
  }

  try {
    // Verify OTP via Gateway
        const verify = await axios.post(
      `${process.env.GATEWAY_URL}/api/gateway/verify-otp`,
      { providerRef, otp },
      { validateStatus: () => true }
    );

    // OTP locked / attempts exceeded
    if (verify.data.status === 'FAILED') {
      txn.status = 'FAILED';
      await txn.save();

      return res.status(403).json({
        message: verify.data.message || 'OTP attempts exceeded'
      });
    }

    // Wrong OTP → allow retry
    if (verify.data.status !== 'SUCCESS') {
      return res.status(400).json({
        message: verify.data.message || 'Invalid OTP',
        attemptsLeft: verify.data.attemptsLeft
      });
    }
    // OTP success — bank has confirmed, money may be deducted
    txn.paymentStage = 'BANK_CONFIRMED';
    await txn.save();


    try {
  // Business logic
      if (txn.purpose === 'BILL_PAYMENT') {
        await axios.post(`${process.env.BILLING_URL}/api/billing/mark-paid`, {
          billId: txn.billId
        });
      }

      if (txn.purpose === 'TOP_UP') {
        await axios.post(`${process.env.USER_URL}/api/wallet/topup`, {
          userId: txn.userId,
          amount: txn.amount
        });
      }

      txn.status = 'COMPLETED';
      txn.paymentStage = 'BUSINESS_DONE';
      await txn.save();
      return res.json({ message: 'Payment completed', transaction: txn });

    } catch (businessErr) {
      console.error('Downstream failed, attempting rollback:', businessErr.message);

      try {
        await axios.post(`${process.env.GATEWAY_URL}/api/gateway/rollback`, {
          providerRef: txn.providerRef,
          amount: txn.amount
        });

        txn.status = 'ROLLED_BACK';
        txn.paymentStage = 'BANK_CONFIRMED';
        await txn.save();

        return res.status(500).json({
          message: 'Payment rolled back due to downstream failure'
        });

      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr.message);

        // **Important:** update DB to indicate rollback attempt failed
        txn.status = 'ROLLBACK_FAILED';
        txn.paymentStage = 'BANK_CONFIRMED';
        await txn.save();

        return res.status(500).json({
          message: 'Payment failed and rollback failed',
          error: rollbackErr.message
        });
      }
    }

  } catch (err) {
  console.error('OTP verification/network error:', err.message);

  // If money may have been deducted, do NOT mark FAILED
  // if (txn.status === 'PENDING') {
  //   txn.status = 'FAILED';
  //   await txn.save();
  // }

  // Only mark FAILED if the bank never confirmed payment
  if (txn.paymentStage === 'OTP_PENDING') {
    txn.status = 'FAILED';
    await txn.save();
  }

  return res.status(500).json({ message: 'Payment failed' });
}
};


module.exports = { initiatePayment, confirmPayment };
