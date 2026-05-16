const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendVerificationEmail, generateOTP } = require('../services/emailService');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            // If user exists but not verified, allow resend
            if (!existingUser.is_verified) {
                // Generate new OTP
                const otp = generateOTP();
                const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

                existingUser.verification_otp = otp;
                existingUser.verification_otp_expires = otpExpires;
                await existingUser.save();

                // Send verification email in background
                sendVerificationEmail(email, otp, existingUser.username).catch(err => {
                    console.error('❌ Background Email Error:', err.message);
                });

                return res.status(200).json({
                    success: true,
                    message: 'Verification code sent to your email',
                    requires_verification: true
                });
            }

            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Check if username exists
        const existingUsername = await User.findOne({
            where: { username }
        });

        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username already taken'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user (unverified)
        const user = await User.create({
            username,
            email,
            password,
            is_verified: false,
            verification_otp: otp,
            verification_otp_expires: otpExpires
        });

        // Send verification email in background
        sendVerificationEmail(email, otp, username).catch(err => {
            console.error('❌ Background Email Error:', err.message);
        });

        res.status(201).json({
            success: true,
            message: 'Account created. Please check your email for verification code.',
            requires_verification: true,
            email: email
        });
    } catch (error) {
        console.error('Signup error:', error);
        // Return detailed error for debugging
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create account',
            error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.validatePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if email is verified
        if (!user.is_verified) {
            // Generate new OTP and send
            const otp = generateOTP();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

            user.verification_otp = otp;
            user.verification_otp_expires = otpExpires;
            await user.save();

            // Send verification email in background
            sendVerificationEmail(email, otp, user.username).catch(err => {
                console.error('❌ Background Email Error:', err.message);
            });

            return res.status(403).json({
                success: false,
                message: 'Please verify your email first. A new verification code has been sent.',
                requires_verification: true,
                email: email
            });
        }

        // Check if user is permanently blocked
        if (user.is_blocked === true) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been permanently blocked due to repeated violations. Please contact support.',
                is_blocked: true
            });
        }

        // Check if user is temporarily banned
        if (user.banned_until && new Date(user.banned_until) > new Date()) {
            const daysLeft = Math.ceil((new Date(user.banned_until) - new Date()) / (1000 * 60 * 60 * 24));
            return res.status(403).json({
                success: false,
                message: `Your account is temporarily suspended. You can log in again in ${daysLeft} day(s).`,
                is_banned: true,
                banned_until: user.banned_until
            });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { avatar, bio } = req.body;

        const user = await User.findByPk(req.user.id);

        if (avatar) user.avatar = avatar;
        if (bio !== undefined) user.bio = bio;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(req.user.id);

        // Verify current password
        const isMatch = await user.validatePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Complete onboarding
// @route   PUT /api/auth/complete-onboarding
// @access  Private
exports.completeOnboarding = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);

        user.has_completed_onboarding = true;
        await user.save();

        res.json({
            success: true,
            message: 'Onboarding completed',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Check if OTP matches
        if (user.verification_otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // Check if OTP expired
        if (new Date() > new Date(user.verification_otp_expires)) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.'
            });
        }

        // Mark as verified
        user.is_verified = true;
        user.verification_otp = null;
        user.verification_otp_expires = null;
        await user.save();

        // Generate token for auto-login
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Email verified successfully!',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.verification_otp = otp;
        user.verification_otp_expires = otpExpires;
        await user.save();

        // Send verification email in background
        sendVerificationEmail(email, otp, user.username).catch(err => {
            console.error('❌ Background Email Error:', err.message);
        });

        res.json({
            success: true,
            message: 'New verification code sent to your email'
        });
    } catch (error) {
        next(error);
    }
};
