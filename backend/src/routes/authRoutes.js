const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, signupRules, loginRules } = require('../middleware/validate');

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', signupRules, validate, authController.signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginRules, validate, authController.login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, authController.updateProfile);

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', protect, authController.changePassword);

// Password Reset Routes
const passwordController = require('../controllers/passwordController');

// @route   POST /api/auth/forgot-password
// @desc    Request password reset token
// @access  Public
router.post('/forgot-password', passwordController.forgotPassword);

// @route   GET /api/auth/verify-reset-token/:token
// @desc    Verify reset token is valid
// @access  Public
router.get('/verify-reset-token/:token', passwordController.verifyResetToken);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', passwordController.resetPassword);

// @route   PUT /api/auth/complete-onboarding
// @desc    Mark user's onboarding as complete
// @access  Private
router.put('/complete-onboarding', protect, authController.completeOnboarding);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP code
// @access  Public
router.post('/verify-otp', authController.verifyOTP);

// @route   POST /api/auth/resend-otp
// @desc    Resend verification OTP
// @access  Public
router.post('/resend-otp', authController.resendOTP);

module.exports = router;
