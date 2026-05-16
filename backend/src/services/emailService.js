/**
 * Email Service - Gmail SMTP with Nodemailer
 * Sends OTP verification emails
 */

const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000
    });
};

/**
 * Send OTP verification email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} username - User's username
 */
const sendVerificationEmail = async (to, otp, username) => {
    const transporter = createTransporter();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3399ff; margin: 0; font-size: 28px;">MeriDramaList</h1>
                <p style="color: #888; margin-top: 5px;">Pakistani Drama Tracker</p>
            </div>
            
            <h2 style="color: #ffffff; text-align: center; margin-bottom: 10px;">Welcome, ${username}! 🎬</h2>
            <p style="color: #aaa; text-align: center; margin-bottom: 30px;">Enter this code to verify your email address:</p>
            
            <div style="background: rgba(51, 153, 255, 0.1); border: 2px solid #3399ff; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3399ff;">${otp}</span>
            </div>
            
            <p style="color: #888; text-align: center; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
            <p style="color: #666; text-align: center; font-size: 12px; margin-top: 30px;">If you didn't create an account, please ignore this email.</p>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: {
            name: 'MeriDramaList',
            address: process.env.SMTP_EMAIL
        },
        to: to,
        subject: `${otp} is your MeriDramaList verification code`,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error;
    }
};

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
    sendVerificationEmail,
    generateOTP
};
