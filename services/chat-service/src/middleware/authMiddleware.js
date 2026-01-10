const jwt = require('jsonwebtoken');

const socketAuth = (socket, next) => {
  // Access token from handshake (passed in 'auth' object or headers)
  const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];

  if (!token) {
    return next(new Error('Authentication error: Token missing'));
  }

  try {
    // Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user data to the socket object for use in handlers
    socket.user = {
      id: decoded.sub || decoded.id,
      name: decoded.name,
      role: decoded.role // e.g., 'customer' or 'agent'
    };
    
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = { socketAuth };