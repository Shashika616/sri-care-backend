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

// @desc    Mark a bill as paid (called by Payment Service)
// @route   POST /api/billing/mark-paid
// @access  Internal (can use a gateway secret)
const markBillPaid = async (req, res) => {
  try {
    const { billId } = req.body;
    console.log("Bill ID: ", billId);

    if (!billId) {
      return res.status(400).json({ message: 'billId is required' });
    }

    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Only update if unpaid
    if (bill.status === 'paid') {
      return res.status(200).json({ message: 'Bill already paid' });
    }

    bill.status = 'paid';
    await bill.save();

    // Optional: emit event for other services
    billingEmitter.emit('billPaid', { billId: bill._id, userId: bill.userId, amount: bill.amount });

    res.json({ message: 'Bill marked as paid', bill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getUserBills,
  generateBill,
  markBillPaid,
};
