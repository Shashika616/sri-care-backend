const Bill = require('../models/billModel');
const billingEmitter = require('../events/eventEmitter');

// @desc    Get all bills for a user
// @route   GET /api/billing
// @access  Protected
// GET /api/billing
const getUserBills = async (req, res) => {
  try {
    const userId = req.userId; // from middleware

    const bills = await Bill.find({ userId }).sort({ billingMonth: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Generate a new bill (admin / mock)
// @route   POST /api/billing
// @access  Protected
const generateBill = async (req, res) => {
  try {
    const userId = req.userId; //  MUST be ObjectId string
    const { billingMonth, amount } = req.body;

    if (!billingMonth) {
      return res.status(400).json({ message: 'billingMonth is required' });
    }

    const bill = await Bill.create({
      userId,
      billingMonth,
      amount: amount || 0,
      status: 'unpaid',
    });

    // Later: emit billGenerated event
    res.status(201).json(bill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getUserBills,
  generateBill,
};
