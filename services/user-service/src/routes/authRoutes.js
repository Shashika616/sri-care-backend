// src/routes/authRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const {
  registerUser,
  authUser,
  changePassword,
  generatePasswordResetToken,
  resetPassword,
} = require('../controllers/authController');

// Routes
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/change-password', protect, changePassword); 
router.post('/reset-password', generatePasswordResetToken);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
