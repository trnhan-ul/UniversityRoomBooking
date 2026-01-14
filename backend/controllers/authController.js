const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Tạo JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' } // Token hết hạn sau 7 ngày
    );
};

// Đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Kiểm tra email và password có được nhập không
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // 2. Kiểm tra email có đúng định dạng @fpt.edu.vn không
        if (!email.endsWith('@fpt.edu.vn')) {
            return res.status(400).json({
                success: false,
                message: 'Please use FPT University email (@fpt.edu.vn)'
            });
        }

        // 3. Tìm user trong database (kèm theo password để so sánh)
        const user = await User.findOne({ email }).select('+password');

        // 4. Kiểm tra user có tồn tại không
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // 5. So sánh password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // 6. Kiểm tra trạng thái tài khoản
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administrator.'
            });
        }

        // 7. Kiểm tra email đã được xác thực chưa
        if (!user.is_email_verified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in. Check your inbox for verification link.'
            });
        }

        // 8. Tạo token
        const token = generateToken(user._id);

        // 9. Trả về thông tin user và token (không trả password)
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    phone_number: user.phone_number,
                    avatar_url: user.avatar_url,
                    is_email_verified: user.is_email_verified,
                    status: user.status
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later'
        });
    }
};

// ============================================
// PASSWORD RESET FUNCTIONS
// ============================================

const nodemailer = require('nodemailer');
const PasswordReset = require('../models/PasswordReset');
const { PASSWORD_RESET_EXPIRY } = require('../config/constants');
const { passwordResetTemplate } = require('../templates/emailTemplates');

// Helper function: Gửi email với mã OTP
const sendResetCodeEmail = async (email, code) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: `"FPT University Room Booking" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Code - FPT Room Booking',
            html: passwordResetTemplate(code, PASSWORD_RESET_EXPIRY)
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
};

// UC-04: Request Password Reset (Forgot Password)
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Validate email input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email address'
            });
        }

        // 2. Validate FPT email format
        if (!email.endsWith('@fpt.edu.vn')) {
            return res.status(400).json({
                success: false,
                message: 'Please use FPT University email (@fpt.edu.vn)'
            });
        }

        // 3. Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            // Security: Không tiết lộ email không tồn tại
            return res.status(200).json({
                success: true,
                message: 'If your email exists in our system, you will receive a verification code shortly.'
            });
        }

        // 4. Check if account is active
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administrator.'
            });
        }

        // 5. Generate 6-digit verification code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 6. Calculate expiry time (1 hour from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_EXPIRY);

        // 7. Delete any existing unused codes for this user
        await PasswordReset.deleteMany({
            user_id: user._id,
            is_used: false
        });

        // 8. Save reset code to database
        await PasswordReset.create({
            user_id: user._id,
            token: resetCode,
            expires_at: expiresAt,
            is_used: false
        });

        // 9. Send reset code email
        const emailResult = await sendResetCodeEmail(email, resetCode);

        if (!emailResult.success) {
            console.error('Failed to send reset email:', emailResult.error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification code. Please try again later.'
            });
        }

        // 10. Return success response
        res.status(200).json({
            success: true,
            message: 'A 6-digit verification code has been sent to your email. Please check your inbox.',
            data: {
                email: email,
                expiresIn: `${PASSWORD_RESET_EXPIRY} hour(s)`
            }
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// UC-05: Reset Password with Code
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        // 1. Validate input
        if (!email || !code || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, verification code and new password are required'
            });
        }

        // 2. Validate FPT email format
        if (!email.endsWith('@fpt.edu.vn')) {
            return res.status(400).json({
                success: false,
                message: 'Please use FPT University email (@fpt.edu.vn)'
            });
        }

        // 3. Validate code format (6 digits)
        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({
                success: false,
                message: 'Verification code must be 6 digits'
            });
        }

        // 4. Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // 5. Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 6. Find valid reset code
        const resetRecord = await PasswordReset.findOne({
            user_id: user._id,
            token: code,
            is_used: false,
            expires_at: { $gt: new Date() }
        });

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code. Please request a new code.'
            });
        }

        // 7. Check account status
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administrator.'
            });
        }

        // 8. Update password (tự động hash nhờ pre-save hook)
        user.password = newPassword;
        await user.save();

        // 9. Mark code as used
        resetRecord.is_used = true;
        await resetRecord.save();

        // 10. Delete all other reset codes for this user
        await PasswordReset.deleteMany({
            user_id: user._id,
            _id: { $ne: resetRecord._id }
        });

        // 11. Return success response
        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.',
            data: {
                email: user.email
            }
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

module.exports = {
    login,
    forgotPassword,
    resetPassword
};
