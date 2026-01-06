const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const GATEWAY_SECRET = process.env.GATEWAY_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

console.log('=== API GATEWAY STARTUP ===');
console.log('JWT_SECRET loaded:', JWT_SECRET ? 'YES' : 'NO');
console.log('JWT_SECRET value (first 5 chars):', JWT_SECRET ? JWT_SECRET.substring(0, 5) + '...' : 'undefined');
console.log('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 0);
console.log('===========================');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    
    console.log('=== GATEWAY AUTH ATTEMPT ===');
    console.log('Token (first 30 chars):', token.substring(0, 30) + '...');
    console.log('Using JWT_SECRET:', JWT_SECRET);
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('Token verified! User ID:', decoded.id);
    
    req.userId = decoded.id;
    req.userRole = decoded.role || 'user';
    req.gatewaySecret = GATEWAY_SECRET;

    console.log(`Gateway: User ${req.userId} authenticated`);
    console.log('============================');
    next();
  } catch (err) {
    console.error('=== GATEWAY AUTH ERROR ===');
    console.error('Error:', err.message);
    console.error('JWT_SECRET being used:', JWT_SECRET);
    console.error('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 'undefined');
    console.error('=========================');
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = { protect };