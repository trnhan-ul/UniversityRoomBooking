const express = require('express');
const router = express.Router();
const {
    login,
    register,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

// POST /api/auth/login - Đăng nhập
router.post('/login', login);

// POST /api/auth/register - Đăng ký tài khoản mới
router.post('/register', register);

// GET /api/auth/verify-email?token=xxx - Xác thực email
router.get('/verify-email', verifyEmail);

// POST /api/auth/resend-verification - Gửi lại email xác thực
router.post('/resend-verification', resendVerificationEmail);

// POST /api/auth/forgot-password - UC-04: Yêu cầu mã reset password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password - UC-05: Reset password với mã xác thực
router.post('/reset-password', resetPassword);

module.exports = router;
