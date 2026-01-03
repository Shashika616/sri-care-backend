// src/controllers/authController.js
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, mobileNumber, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ $or: [{ email }, { mobileNumber }] });
  if (userExists) {
    return res.status(400).json({ message: 'User with email or mobile already exists' });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    mobileNumber,
    passwordHash: password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

/**
 * @desc    Change password for logged-in user
 * @route   POST /api/users/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  const userId = req.user._id; // from auth middleware
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Verify current password
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  // Update password
  user.passwordHash = newPassword;
  await user.save();

  res.json({ message: 'Password changed successfully' });
};

/**
 * @desc    Generate password reset token and send email
 * @route   POST /api/users/reset-password
 * @access  Public
 */
const generatePasswordResetToken = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate a secure token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Password reset URL (frontend handles form)
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Email message
  const message = `Hello ${user.name},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetURL}\n\nIf you did not request this, please ignore this email.\n\n- Sri-Care Team`;

  // Send email
  await sendEmail(user.email, 'Sri-Care Password Reset', message);

  res.json({ message: 'Password reset email sent' });
};

/**
 * @desc    Reset password using token
 * @route   POST /api/users/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  user.passwordHash = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
};

module.exports = {
  registerUser,
  authUser,
  changePassword,
  generatePasswordResetToken,
  resetPassword,
};
