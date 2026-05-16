const { User } = require('../models');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a secure random token
 */
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// @desc    Request password reset (generates token)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user by email
        const user = await User.findOne({ where: { email: email.toLowerCase() } });

        // Always return success to prevent email enumeration attacks
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been generated.'
            });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Save to user
        user.reset_token = resetToken;
        user.reset_token_expires = resetTokenExpires;
        await user.save();

        // In production, you would send an email with the reset link here
        // For now, we'll return the token in the response (DEV ONLY)
        // The frontend should construct: /reset-password?token={resetToken}

        // Log the token for development testing
        console.log(`[PASSWORD RESET] Token generated for ${email}: ${resetToken}`);
        console.log(`[PASSWORD RESET] Reset link: /reset-password?token=${resetToken}`);

        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been generated.',
            // DEV ONLY - Remove in production!
            devToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify reset token is valid
// @route   GET /api/auth/verify-reset-token/:token
// @access  Public
exports.verifyResetToken = async (req, res, next) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is required'
            });
        }

        // Find user with this token that hasn't expired
        const user = await User.findOne({
            where: {
                reset_token: token
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Check if token has expired
        if (new Date() > new Date(user.reset_token_expires)) {
            // Clear the expired token
            user.reset_token = null;
            user.reset_token_expires = null;
            await user.save();

            return res.status(400).json({
                success: false,
                message: 'Reset token has expired. Please request a new one.'
            });
        }

        res.json({
            success: true,
            message: 'Token is valid',
            email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2') // Mask email for privacy
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        const { token, password, confirmPassword } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Find user with valid token
        const user = await User.findOne({
            where: {
                reset_token: token
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Check if token has expired
        if (new Date() > new Date(user.reset_token_expires)) {
            user.reset_token = null;
            user.reset_token_expires = null;
            await user.save();

            return res.status(400).json({
                success: false,
                message: 'Reset token has expired. Please request a new one.'
            });
        }

        // Update password and clear reset token
        user.password = password; // Will be hashed by beforeUpdate hook
        user.reset_token = null;
        user.reset_token_expires = null;
        await user.save();

        console.log(`[PASSWORD RESET] Password successfully reset for ${user.email}`);

        res.json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        next(error);
    }
};
