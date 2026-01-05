const mongoose = require('mongoose');

const BankTransactionSchema = new mongoose.Schema({
  providerRef: { type: String, required: true, unique: true },
  cardNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  otp: { type: String },
  otpExpires: { type: Date },
  otpAttempts: { type: Number, default: 0 }, // Track OTP attempts
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'ROLLED_BACK'], default: 'PENDING' },
});

module.exports = mongoose.model('BankTransaction', BankTransactionSchema);
