// src/middleware/authMiddleware.js
const mongoose = require('mongoose');

const GATEWAY_SECRET = process.env.GATEWAY_SECRET;

const protect = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const gatewaySecret = req.headers['x-gateway-secret'];

  // DEBUG LOGS (important for you right now)
  console.log('Incoming headers:', {
    'x-user-id': userId,
    'x-gateway-secret': gatewaySecret
  });

  // Trust check: only gateway can call this service
  // if (!gatewaySecret || gatewaySecret !== GATEWAY_SECRET) {
  //   return res.status(401).json({
  //     message: 'Not authorized: invalid gateway secret'
  //   });
  // }

  // User ID must exist
  if (!userId) {
    return res.status(401).json({
      message: 'x-user-id header missing'
    });
  }

  // Validate Mongo ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      message: 'Invalid userId format'
    });
  }

  // Attach trusted userId to request
  req.userId = userId;

  next();
};

module.exports = { protect };
