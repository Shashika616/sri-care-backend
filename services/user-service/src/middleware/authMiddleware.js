// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Protect routes middleware
const protect = async (req, res, next) => {
  let token;

  try {
    // Check for Bearer token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]; // Get the token

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB (exclude password)
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next(); // allow access to route
    } else {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

module.exports = { protect };
