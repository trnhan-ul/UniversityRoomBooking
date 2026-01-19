const express = require('express');
const router = express.Router();
const {
    login,
    register,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    verifyToken
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.get('/verify-token', authenticate, verifyToken);

// POST /api/auth/forgot-password - UC-04: Yêu cầu mã reset password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password - UC-05: Reset password với mã xác thực
router.post('/reset-password', resetPassword);

module.exports = router;
