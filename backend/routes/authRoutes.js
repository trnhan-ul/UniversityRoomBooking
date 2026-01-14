const express = require('express');
const router = express.Router();
const { login, forgotPassword, resetPassword } = require('../controllers/authController');

// POST /api/auth/login - Đăng nhập
router.post('/login', login);

// POST /api/auth/forgot-password - UC-04: Yêu cầu mã reset password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password - UC-05: Reset password với mã xác thực
router.post('/reset-password', resetPassword);

module.exports = router;
