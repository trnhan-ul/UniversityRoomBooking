/**
 * Email HTML Templates - Password Reset
 * 
 * LƯU Ý: Email HTML KHÔNG THỂ dùng Tailwind CSS vì:
 * - Email clients (Gmail, Outlook) không hỗ trợ external CSS
 * - Không hỗ trợ CSS classes phức tạp
 * - Chỉ hỗ trợ inline styles cơ bản
 * - Phải dùng table-based layout cho tương thích tốt nhất
 */

/**
 * Template email gửi mã OTP reset password
 * @param {string} code - Mã OTP 6 chữ số
 * @param {number} expiryHours - Số giờ hết hạn (mặc định 1 giờ)
 * @returns {string} HTML string với inline styles
 */
const passwordResetTemplate = (code, expiryHours = 1) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #333;">Password Reset Request</h2>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
                You requested to reset your password for FPT University Room Booking System.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
                Use the verification code below to reset your password:
            </p>
            
            <div style="background-color: #f5f5f5; border: 2px dashed #007bff; 
                        border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; 
                            color: #007bff; font-family: 'Courier New', monospace;">
                    ${code}
                </div>
            </div>
            
            <p style="color: #d9534f; font-weight: bold;">
                ⏰ This code will expire in ${expiryHours} hour${expiryHours > 1 ? 's' : ''}.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
                If you didn't request this, please ignore this email and your password will remain unchanged.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
                FPT University Room Booking System<br>
                This is an automated email, please do not reply.
            </p>
        </div>
    `;
};

module.exports = {
    passwordResetTemplate
};
