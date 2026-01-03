// src/middleware/authMiddleware.js
require('dotenv').config();
const mongoose = require('mongoose');

const GATEWAY_SECRET = process.env.GATEWAY_SECRET;
console.log("gateway secrent in billing",GATEWAY_SECRET );
const protect = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const gatewaySecret = req.headers['x-gateway-secret'];
  console.log("Forwarding headers:", {
  "x-user-id": userId,
  "x-gateway-secret": gatewaySecret
});

  // // Ensure secret matches (trust check)
  // if (!gatewaySecret || gatewaySecret !== GATEWAY_SECRET) {
  //   return res.status(401).json({ message: 'Not authorized, invalid gateway secret' });
  // }

  // Ensure userId exists
  if (!userId) {
    return res.status(401).json({ message: 'x-user-id header missing' });
  }

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }

  // Attach userId to request
  req.userId = userId;
  next();
};

module.exports = { protect };
