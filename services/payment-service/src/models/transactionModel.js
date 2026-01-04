// src/models/transactionModel.js
const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    billId: { type: mongoose.Schema.Types.ObjectId },
    cardNumber: {type: Number, required: true},
    amount: { type: Number, required: true },
    purpose: {
      type: String,
      enum: ['BILL_PAYMENT', 'TOP_UP'],
      required: true
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true
    },

    status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING', 'COMPLETED', 'ROLLED_BACK'], required: true },
    providerRef: { type: String }, // Reference ID from mock gateway
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
