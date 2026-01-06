// src/middleware/authMiddleware.js in Billing Service
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const GATEWAY_SECRET = process.env.GATEWAY_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || process.env.USER_SERVICE_JWT_SECRET;

console.log("Gateway secret in billing:", GATEWAY_SECRET);

/**
 * Middleware for user-facing endpoints (uses JWT)
 */
const protect = (req, res, next) => {
  // First check if it's an internal gateway call
  // Add to billing service auth middleware
console.log('📥 Received headers:', {
  'x-gateway-secret': req.headers['x-gateway-secret'] ? '[PRESENT]' : '[MISSING]',
  'authorization': req.headers.authorization ? '[PRESENT]' : '[MISSING]'
});
  const gatewaySecret = req.headers['x-gateway-secret'];

  // ADD THESE TEMPORARY LOGS:
  console.log('--- DEBUG COMPARISON ---');
  console.log('From Header:', `"${gatewaySecret}"`);
  console.log('From Process Env:', `"${GATEWAY_SECRET}"`);
  console.log('Match?', gatewaySecret === GATEWAY_SECRET);
  console.log('------------------------');
  
  if (gatewaySecret === GATEWAY_SECRET) {
    // Internal call from gateway (e.g., from payment service)
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({ message: 'X-User-Id header missing for internal call' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }
    
    req.userId = userId;
    req.isInternalCall = true;
    return next();
  }
  
  // Otherwise, check for user JWT token (user accessing their own data)
  const authHeader = req.headers.authorization;
  console.log("Auth header", authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Validate user ID
    if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({ message: 'Invalid user ID in token' });
    }
    
    req.userId = decoded.id;
    req.userRole = decoded.role || 'user';
    req.isInternalCall = false;
    
    console.log(`User ${req.userId} accessing billing via JWT`);
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    return res.status(401).json({ message: 'Not authorized' });
  }
};



/**
 * Middleware for internal-only endpoints (gateway calls only)
 * Example: /mark-paid endpoint that should only be called by payment service
 */
const internalOnly = (req, res, next) => {
  const gatewaySecret = req.headers['x-gateway-secret'];
  
  if (!gatewaySecret) {
    return res.status(403).json({ 
      message: 'Access denied: gateway secret required',
      hint: 'This endpoint is for internal service calls only'
    });
  }
  
  if (gatewaySecret !== GATEWAY_SECRET) {
    console.warn('Invalid gateway secret attempt:', gatewaySecret);
    return res.status(403).json({ 
      message: 'Invalid gateway secret' 
    });
  }
  
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(400).json({ message: 'x-user-id header required' });
  }
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }
  
  req.userId = userId;
  req.isInternalCall = true;
  
  console.log(`Internal call to billing service for user ${userId}`);
  next();
};

module.exports = { protect, internalOnly };