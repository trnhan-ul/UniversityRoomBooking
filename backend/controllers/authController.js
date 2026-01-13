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
                message: 'Your account has been deactivated'
            });
        }

        // 7. Tạo token
        const token = generateToken(user._id);

        // 8. Trả về thông tin user và token (không trả password)
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
                    phone_number: user.phone_number
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

module.exports = {
    login
};
