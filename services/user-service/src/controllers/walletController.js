const User = require('../models/userModel'); // Assuming you have a User model

// @desc    Top-up user wallet
// @route   POST /api/wallet/topup
// @access  Protected (internal, via gateway)
const topUpWallet = async (req, res) => {
  const gatewaySecret = req.headers['x-gateway-secret'];
  if (!gatewaySecret || gatewaySecret !== process.env.GATEWAY_SECRET) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const { userId, amount } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.walletBalance = (user.walletBalance || 0) + amount;
  await user.save();

  res.json({ message: 'Wallet topped up', walletBalance: user.walletBalance });
};

module.exports = { topUpWallet };
