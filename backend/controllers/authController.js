// controllers/authController.js
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendVerificationEmail, sendResetEmail } = require('../utils/sendEmail');

// @desc    Register a new user (sends verification email)
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === 'admin') {
      return res.status(400).json({ message: 'Cannot register as admin' });
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    if (!pwdRegex.test(password)) {
      return res.status(400).json({ message: 'Password must contain uppercase, lowercase, number, and special character' });
    }

    const exists = await User.findOne({ email });
    if (exists && exists.emailVerified) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // If unverified account exists, delete it so they can re-register
    if (exists && !exists.emailVerified) {
      await User.deleteOne({ _id: exists._id });
    }

    const code = crypto.randomInt(100000, 999999).toString();

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'seeker',
      emailVerified: false,
      emailVerificationCode: code,
      emailVerificationExpires: Date.now() + 15 * 60 * 1000,
    });

    await sendVerificationEmail(email, code);

    res.status(201).json({
      success: true,
      message: 'Verification code sent to your email.',
      pendingVerification: true,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Verify email with OTP code
// @route   POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, emailVerified: false });

    if (!user) {
      return res.status(400).json({ message: 'No pending verification for this email' });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    user.emailVerificationCode = code;
    user.emailVerificationExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(email, code);

    res.json({ success: true, message: 'New verification code sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email first', pendingVerification: true, email: user.email });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been suspended' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc    Forgot password — send reset code via email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account with that email' });
    }

    const resetToken = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendResetEmail(email, resetToken);

    res.json({
      success: true,
      message: 'Reset code sent to your email.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    if (!pwdRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain uppercase, lowercase, number, and special character' });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, verifyEmail, resendVerification };
