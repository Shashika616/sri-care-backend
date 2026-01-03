const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    billingMonth: { type: String, required: true }, // e.g., "January 2026"
    amount: { type: Number, required: true },
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    details: { type: Object }, // Could include usage, VAS charges, etc.
  },
  { timestamps: true }
);

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
