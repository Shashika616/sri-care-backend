const Card = require('../models/cardModel');
const BankTransaction = require('../models/bankTransactionModel');
const generateOTP = require('../utils/otpGenerator');
const { sendEmailOTP, sendSmsOTP } = require('../utils/otpSender');

// POST /bank/validate-card
const validateCard = async (req, res) => {
  const { cardNumber, expiry, cvv, amount, providerRef } = req.body;

  if (!cardNumber || !expiry || !cvv || !amount || !providerRef) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const card = await Card.findOne({ cardNumber, expiry, cvv });
  if (!card) return res.status(404).json({ message: 'Card not found' });
  if (card.availableBalance < amount) return res.status(402).json({ message: 'Insufficient balance' });

  // Create bank transaction
  const otp = generateOTP();
  const txn = await BankTransaction.create({
    providerRef,
    cardNumber,
    amount,
    otp,
    otpExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    otpAttempts: 0,
    status: 'PENDING',
  });

  // Send OTP
  if (card.email) sendEmailOTP(card.email, otp);
  if (card.phone) sendSmsOTP(card.phone, otp);

  res.json({
    transactionRef: providerRef,
    message: 'OTP sent to user via available channels',
    otpSent: true
  });
};

// POST /bank/verify-otp
const verifyOtp = async (req, res) => {
  const { providerRef, otp } = req.body;

  if (!providerRef || !otp) return res.status(400).json({ message: 'Missing required fields' });

  const txn = await BankTransaction.findOne({ providerRef });
  if (!txn) return res.status(404).json({ status: 'FAILED', message: 'Invalid providerRef' });

    if (txn.status !== 'PENDING') {
    return res.status(400).json({
      status: 'FAILED',
      message: `Transaction already ${txn.status}`,
    });
  }

  // Check OTP attempts limit
  if (txn.otpAttempts >= 3) {
    txn.status = 'FAILED';
    await txn.save();
    return res.status(403).json({ status: 'FAILED', message: 'OTP attempt limit exceeded' });
  }

   // Invalid or expired OTP
    if (txn.otp !== otp || txn.otpExpires < new Date()) {
    txn.otpAttempts += 1;
    await txn.save();

    const attemptsLeft = 3 - txn.otpAttempts;

    if (attemptsLeft <= 0) {
      txn.status = 'FAILED';
      await txn.save();
      return res.status(403).json({
        status: 'FAILED',
        message: 'OTP attempt limit exceeded'
      });
    }

    return res.status(400).json({
      status: 'INVALID_OTP',
      message: 'Invalid OTP',
      attemptsLeft
    });
  }

  const card = await Card.findOne({ cardNumber: txn.cardNumber });
  if (!card) return res.status(404).json({ status: 'FAILED', message: 'Card not found' });

  // Deduct balance
  card.availableBalance -= txn.amount;
  await card.save();

  txn.status = 'SUCCESS';
  txn.otp = null;
  txn.otpExpires = null;
  txn.otpAttempts = 0;
  await txn.save();

  res.json({ status: 'SUCCESS', message: 'Payment approved', transactionRef: providerRef });
};

// GET /bank/balance/:cardNumber
const getBalance = async (req, res) => {
  const { cardNumber } = req.params;
  const card = await Card.findOne({ cardNumber });
  if (!card) return res.status(404).json({ message: 'Card not found' });

  res.json({ availableBalance: card.availableBalance });
};

// POST /bank/rollback
const rollbackTransaction = async (req, res) => {
  const { providerRef, amount } = req.body;

  if (!providerRef || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Find successful transaction
  const txn = await BankTransaction.findOne({
    providerRef,
    status: 'SUCCESS'
  });

  if (!txn) {
    return res.status(404).json({
      status: 'FAILED',
      message: 'Transaction not found or not eligible for rollback'
    });
  }

  // Prevent double rollback
  if (txn.status === 'ROLLED_BACK') {
    return res.status(409).json({
      status: 'FAILED',
      message: 'Transaction already rolled back'
    });
  }

  const card = await Card.findOne({ cardNumber: txn.cardNumber });
  if (!card) {
    return res.status(404).json({
      status: 'FAILED',
      message: 'Card not found'
    });
  }

  //  Credit back the amount
  card.availableBalance += amount;
  await card.save();

  // Mark transaction rolled back
  txn.status = 'ROLLED_BACK';
  await txn.save();

  return res.json({
    status: 'SUCCESS',
    message: 'Transaction rolled back successfully',
    transactionRef: providerRef
  });
};


module.exports = { validateCard, verifyOtp, getBalance, rollbackTransaction };
