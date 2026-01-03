const Bill = require('../models/billModel');
const billingEmitter = require('../events/eventEmitter');

// @desc    Get all bills for a user
// @route   GET /api/billing
// @access  Protected
const getUserBills = async (req, res) => {
  const userId = req.user._id;
  const bills = await Bill.find({ userId }).sort({ billingMonth: -1 });
  res.json(bills);
};

// @desc    Generate a new bill (admin / mock)
// @route   POST /api/billing
// @access  Protected
const generateBill = async (req, res) => {
  const { userId, billingMonth, amount, details } = req.body;

  const bill = await Bill.create({
    userId,
    billingMonth,
    amount,
    details,
  });

  // Emit event for Notification Service
  billingEmitter.emit('billGenerated', { userId, billingMonth, amount });

  res.status(201).json(bill);
};

module.exports = {
  getUserBills,
  generateBill,
};
