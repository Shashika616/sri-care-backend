// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const GATEWAY_SECRET = process.env.GATEWAY_SECRET;

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Extract token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store user info internally
    req.userId = decoded.id;
    req.userRole = decoded.role || 'user';
    req.gatewaySecret = GATEWAY_SECRET;

    console.log(`Request from user ${req.userId} with role ${req.userRole} forwarded with gateway secret`);

    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = { protect };
