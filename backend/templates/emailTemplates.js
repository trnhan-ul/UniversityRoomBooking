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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f8;">
            <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header with FPT Orange -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="background-color: #FF6C00; border-radius: 12px; width: 80px; height: 80px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 40px; color: white;">🔒</span>
                    </div>
                    <h1 style="color: #0f172a; font-size: 28px; margin: 20px 0 10px 0;">UniBooking</h1>
                    <p style="color: #64748b; margin: 0;">FPT University Room Booking System</p>
                </div>
                
                <h2 style="color: #0f172a; font-size: 24px; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    You requested to reset your password for FPT University Room Booking System. 
                    Use the verification code below to reset your password:
                </p>
                
                <div style="background-color: #eff6ff; border: 2px dashed #136dec; 
                            border-radius: 8px; padding: 24px; text-align: center; margin: 30px 0;">
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; 
                                color: #136dec; font-family: 'Courier New', monospace;">
                        ${code}
                    </div>
                </div>
                
                <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin-top: 30px;">
                    ⏰ This code will expire in ${expiryHours} hour${expiryHours > 1 ? 's' : ''}.
                </p>
                
                <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                    If you didn't request this, please ignore this email and your password will remain unchanged.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                    FPT University Room Booking System<br>
                    This is an automated email, please do not reply.
                </p>
            </div>
        </div>
    `;
};

/**
 * Template email xác thực tài khoản (Email Verification)
 * @param {string} verificationLink - Link xác thực email
 * @returns {string} HTML string với inline styles
 */
const emailVerificationTemplate = (verificationLink) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email | UniBooking</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Lexend', Arial, sans-serif; background-color: #f6f7f8;">
            
            <!-- Main Container -->
            <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <!-- Content Card -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                            <tr>
                                <td style="padding: 48px 32px; text-align: center;">
                                    
                                    <!-- Icon Circle -->
                                    <div style="margin: 0 auto 32px; width: 120px; height: 120px; background-color: #eff6ff; border-radius: 50%; display: inline-block;">
                                        <table width="100%" height="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" valign="middle">
                                                    <span style="font-size: 56px; display: inline-block;">✉️</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>

                                    <!-- Title -->
                                    <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.2;">
                                        Verify Your Email Address
                                    </h1>

                                    <!-- Body Text -->
                                    <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0; max-width: 420px; margin-left: auto; margin-right: auto;">
                                        Thank you for registering with UniBooking! To complete your registration and start booking classrooms, please verify your email address by clicking the button below.
                                    </p>

                                    <!-- Primary CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                        <tr>
                                            <td align="center">
                                                <a href="${verificationLink}" style="display: inline-block; background-color: #136dec; color: white; text-decoration: none; font-weight: 600; padding: 14px 40px; border-radius: 6px; font-size: 15px;">
                                                    Verify Email Address
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Divider -->
                                    <div style="border-top: 1px solid #e2e8f0; margin: 32px 0; padding-top: 24px;">
                                        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px 0;">
                                            If you didn't create an account, you can safely ignore this email.
                                        </p>
                                        
                                        <p style="color: #cbd5e1; font-size: 13px; margin: 0;">
                                            This link will expire in 24 hours for security reasons.
                                        </p>
                                    </div>

                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            <!-- Footer -->
            <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 20px;">
                <tr>
                    <td align="center">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            © 2026 FPT University Room Booking System
                        </p>
                        <p style="color: #cbd5e1; font-size: 11px; margin: 8px 0 0 0;">
                            This is an automated email, please do not reply.
                        </p>
                    </td>
                </tr>
            </table>

        </body>
        </html>
    `;
};

const bookingApprovalTemplate = (
  booking,
  room,
  status,
  rejectReason = null,
) => {
  const isApproved = status === "APPROVED";
  const bookingDate = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isApproved ? "Booking Approved" : "Booking Rejected"} | UniBooking</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Lexend', Arial, sans-serif; background-color: #f6f7f8;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
              <tr>
                <td style="background: ${isApproved ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)" : "linear-gradient(135deg, #f44336 0%, #da190b 100%)"}; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; font-size: 32px; margin: 0; font-weight: 700;">
                    ${isApproved ? "✅ Booking Approved" : "❌ Booking Rejected"}
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 32px;">
                  
                  <p style="color: #0f172a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Hello <strong>${booking.user_id.full_name}</strong>,
                  </p>

                  <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
                    ${
                      isApproved
                        ? "Your room booking has been successfully approved. The time slot is now reserved for you."
                        : "Unfortunately, your room booking could not be approved. Please see the details below."
                    }
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${isApproved ? "#e8f5e9" : "#ffebee"}; border-left: 4px solid ${isApproved ? "#4caf50" : "#f44336"}; border-radius: 6px; margin-bottom: 32px;">
                    <tr>
                      <td style="padding: 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-bottom: 12px;">
                              <span style="color: #666; font-size: 13px; font-weight: 600;">ROOM</span><br>
                              <span style="color: #0f172a; font-size: 16px; font-weight: 700;">${room.name}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: 12px;">
                              <span style="color: #666; font-size: 13px; font-weight: 600;">LOCATION</span><br>
                              <span style="color: #0f172a; font-size: 15px;">${room.location}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: 12px;">
                              <span style="color: #666; font-size: 13px; font-weight: 600;">DATE</span><br>
                              <span style="color: #0f172a; font-size: 15px;">${bookingDate}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: 12px;">
                              <span style="color: #666; font-size: 13px; font-weight: 600;">TIME</span><br>
                              <span style="color: #0f172a; font-size: 15px; font-weight: 600;">${booking.start_time} - ${booking.end_time}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: ${isApproved ? "0" : "12px"};">
                              <span style="color: #666; font-size: 13px; font-weight: 600;">PURPOSE</span><br>
                              <span style="color: #0f172a; font-size: 14px;">${booking.purpose}</span>
                            </td>
                          </tr>
                          ${
                            !isApproved && rejectReason
                              ? `
                          <tr>
                            <td>
                              <span style="color: #d32f2f; font-size: 13px; font-weight: 600;">REJECTION REASON</span><br>
                              <span style="color: #d32f2f; font-size: 14px;">${rejectReason}</span>
                            </td>
                          </tr>
                          `
                              : ""
                          }
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 32px;">
                    <tr>
                      <td>
                        <span style="color: #666; font-size: 12px; font-weight: 600;">STATUS:</span>
                        <span style="color: ${isApproved ? "#4caf50" : "#f44336"}; font-size: 13px; font-weight: 700; margin-left: 8px;">
                          ${status}
                        </span>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
                    If you have any questions, please contact the facility management office.
                  </p>

                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 20px;">
        <tr>
          <td align="center">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © 2026 FPT University Room Booking System
            </p>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
};

module.exports = {
  passwordResetTemplate,
  emailVerificationTemplate,
  bookingApprovalTemplate,
};
