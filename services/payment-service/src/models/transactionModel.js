// src/models/transactionModel.js
const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    billId: { type: mongoose.Schema.Types.ObjectId },
    amount: { type: Number, required: true },
    purpose: {
      type: String,
      enum: ['BILL_PAYMENT', 'TOP_UP'],
      required: true
    },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
    providerRef: { type: String }, // Reference ID from mock gateway
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
