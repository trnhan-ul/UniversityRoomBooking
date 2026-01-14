const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const PasswordReset = require('../models/PasswordReset');
const { PASSWORD_RESET_EXPIRY } = require('../config/constants');
const { passwordResetTemplate, emailVerificationTemplate } = require('../templates/emailTemplates');

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
// EMAIL VERIFICATION FUNCTIONS (REGISTER)
// ============================================

// Helper: Tạo email transporter
const createEmailTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Helper: Gửi email verification link
const sendVerificationEmail = async (email, token) => {
    try {
        const transporter = createEmailTransporter();
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"UniBooking System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - University Room Booking System',
            html: emailVerificationTemplate(verificationLink)
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
};

// Register new user
const register = async (req, res) => {
    try {
        const { email, password, full_name, phone_number } = req.body;

        // 1. Validate required fields
        if (!email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                message: 'Email, password and full name are required'
            });
        }

        // 2. Validate FPT email
        if (!email.endsWith('@fpt.edu.vn')) {
            return res.status(400).json({
                success: false,
                message: 'Please use FPT University email (@fpt.edu.vn)'
            });
        }

        // 3. Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // 4. Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please login or use a different email.'
            });
        }

        // 5. Create new user (password will be auto-hashed by pre-save hook)
        const user = await User.create({
            email,
            password,
            full_name,
            phone_number: phone_number || null,
            role: 'STUDENT', // Default role
            is_email_verified: false,
            status: 'ACTIVE'
        });

        // 6. Generate verification token (valid for 24 hours)
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // 7. Save verification token
        await EmailVerification.create({
            user_id: user._id,
            token: verificationToken,
            expires_at: expiresAt
        });

        // 8. Send verification email
        const emailResult = await sendVerificationEmail(email, verificationToken);

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            // Don't fail registration, user can resend later
        }

        // 9. Return success response
        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            data: {
                email: user.email,
                full_name: user.full_name
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Verify email with token
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        // 1. Validate token
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        // 2. Find verification record
        const verification = await EmailVerification.findOne({
            token,
            verified_at: null,
            expires_at: { $gt: new Date() }
        });

        if (!verification) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification link'
            });
        }

        // 3. Find and update user
        const user = await User.findById(verification.user_id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 4. Update user verification status
        user.is_email_verified = true;
        await user.save();

        // 5. Mark verification as completed
        verification.verified_at = new Date();
        await verification.save();

        // 6. Return success
        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now login to your account.'
        });

    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // 2. Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 3. Check if already verified
        if (user.is_email_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified. Please login.'
            });
        }

        // 4. Delete old verification tokens
        await EmailVerification.deleteMany({ user_id: user._id });

        // 5. Generate new token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // 6. Save new token
        await EmailVerification.create({
            user_id: user._id,
            token: verificationToken,
            expires_at: expiresAt
        });

        // 7. Send email
        const emailResult = await sendVerificationEmail(email, verificationToken);

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again later.'
            });
        }

        // 8. Return success
        res.status(200).json({
            success: true,
            message: 'Verification email has been sent! Please check your inbox.'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// ============================================
// PASSWORD RESET FUNCTIONS
// ============================================

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
    register,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword
};
