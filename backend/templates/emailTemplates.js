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

/**
<<<<<<< HEAD
 * Template email chào mừng khi admin tạo tài khoản cho user
 * @param {Object} userData - Thông tin user {email, password, full_name, role, phone_number}
 * @returns {string} HTML string
 */
const accountCreatedTemplate = (userData) => {
  const { email, password, full_name, role, phone_number } = userData;
  
  // Map role names to friendly display
  const roleDisplayNames = {
    'STUDENT': 'Student',
    'LECTURER': 'Lecturer',
    'FACILITY_MANAGER': 'Facility Manager',
    'ADMINISTRATOR': 'Administrator'
  };
  
  const roleDisplay = roleDisplayNames[role] || role;
  
=======
 * Template email khi Admin reset password cho user
 * @param {object} user - User object { full_name, email }
 * @param {string} newPassword - Mật khẩu mới (plain text)
 * @returns {string} HTML string
 */
const adminPasswordResetTemplate = (user, newPassword) => {
>>>>>>> 9fcf26fe3dfd1a44a219cc9b61d648eec0458d84
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
<<<<<<< HEAD
      <title>Welcome to UniBooking</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      
      <!-- Main Container -->
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px; background-color: #f5f5f5;">
        <tr>
          <td align="center">
            <!-- Content Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              
              <!-- Header with Blue Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 48px 32px; text-align: center;">
                  <!-- Icon Circle with Graduation Cap -->
                  <div style="margin: 0 auto 24px; width: 100px; height: 100px; background-color: rgba(255,255,255,0.2); border-radius: 50%; display: inline-block;">
                    <table width="100" height="100" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" valign="middle">
                          <span style="font-size: 48px; display: inline-block;">🎓</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <h1 style="color: white; font-size: 32px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.2;">
                    Welcome to UniBooking
                  </h1>
                  <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; font-weight: 500;">
                    Your Account Has Been Created
                  </p>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 48px 32px;">
                  
                  <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    Hello <strong style="color: #1e40af;">${full_name}</strong>,
                  </p>

                  <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
                    An account has been created for you in the <strong>FPT University Room Booking System</strong> by System Administrator. You can now log in and start using the system.
                  </p>

                  <!-- Account Details Box -->
                  <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 28px; margin-bottom: 32px; border: 2px solid #93c5fd;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 4px;">
                          <div style="display: flex; align-items: center; margin-bottom: 20px;">
                            <span style="font-size: 18px; margin-right: 8px;">📋</span>
                            <span style="color: #1e40af; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">YOUR ACCOUNT DETAILS</span>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Email -->
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid rgba(59,130,246,0.2);">
                          <div style="color: #6b7280; font-size: 13px; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">EMAIL (USERNAME)</div>
                          <div style="color: #1e40af; font-size: 16px; font-weight: 600; word-break: break-all;">${email}</div>
                        </td>
                      </tr>
                      
                      <!-- Password -->
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid rgba(59,130,246,0.2);">
                          <div style="color: #6b7280; font-size: 13px; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">PASSWORD</div>
                          <div style="background-color: white; border: 2px dashed #93c5fd; border-radius: 6px; padding: 12px 16px; display: inline-block; margin-top: 4px;">
                            <span style="color: #2563eb; font-size: 20px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 2px;">${password}</span>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Full Name -->
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid rgba(59,130,246,0.2);">
                          <div style="color: #6b7280; font-size: 13px; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">FULL NAME</div>
                          <div style="color: #1f2937; font-size: 16px; font-weight: 600;">${full_name}</div>
                        </td>
                      </tr>
                      
                      <!-- Role -->
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid rgba(59,130,246,0.2);">
                          <div style="color: #6b7280; font-size: 13px; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">ROLE</div>
                          <div style="color: #1f2937; font-size: 16px; font-weight: 600;">${roleDisplay}</div>
                        </td>
                      </tr>
                      
                      <!-- Phone Number -->
                      ${phone_number ? `
                      <tr>
                        <td style="padding: 14px 0;">
                          <div style="color: #6b7280; font-size: 13px; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">PHONE NUMBER</div>
                          <div style="color: #1f2937; font-size: 16px; font-weight: 600;">${phone_number}</div>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>

                  <!-- Security Warning -->
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 18px 20px; margin-bottom: 32px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: top; padding-right: 12px;">
                          <span style="font-size: 24px;">⚠️</span>
                        </td>
                        <td>
                          <div style="color: #92400e; font-size: 14px; font-weight: 700; margin-bottom: 4px;">Security Reminder</div>
                          <div style="color: #78350f; font-size: 13px; line-height: 1.5;">
                            For security reasons, please <strong>change your password</strong> after your first login. You can do this from your profile settings.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Login Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                    <tr>
                      <td align="center">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                           style="display: inline-block; 
                                  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
                                  color: white; 
                                  text-decoration: none; 
                                  font-weight: 700; 
                                  padding: 16px 48px; 
                                  border-radius: 8px; 
                                  font-size: 16px;
                                  box-shadow: 0 4px 12px rgba(37,99,235,0.3);
                                  transition: all 0.3s ease;">
                          Login to UniBooking
                        </a>
=======
      <title>Your Password Has Been Reset | UniBooking</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f7f8;">

      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #FF6C00 0%, #e85d00 100%); padding: 36px 32px; text-align: center; border-radius: 12px 12px 0 0;">
                  <div style="font-size: 48px; margin-bottom: 12px;">🔑</div>
                  <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 700;">Password Reset Notification</h1>
                  <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 14px;">UniBooking — FPT University Room Booking System</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 36px 32px;">
                  <p style="color: #0f172a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                    Hello <strong>${user.full_name}</strong>,
                  </p>
                  <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
                    An administrator has reset your password for the FPT University Room Booking System.
                    Your new login credentials are shown below.
                  </p>

                  <!-- Credentials Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; margin-bottom: 28px;">
                    <tr>
                      <td style="padding: 24px;">
                        <p style="color: #92400e; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">Your New Credentials</p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-bottom: 12px;">
                              <span style="color: #78716c; font-size: 13px;">Email</span><br>
                              <span style="color: #0f172a; font-size: 15px; font-weight: 600;">${user.email}</span>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <span style="color: #78716c; font-size: 13px;">New Password</span><br>
                              <span style="color: #0f172a; font-size: 20px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 3px;">${newPassword}</span>
                            </td>
                          </tr>
                        </table>
>>>>>>> 9fcf26fe3dfd1a44a219cc9b61d648eec0458d84
                      </td>
                    </tr>
                  </table>

<<<<<<< HEAD
                  <!-- Additional Info -->
                  <div style="border-top: 2px solid #e5e7eb; padding-top: 24px;">
                    <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
                      If you have any questions or need assistance, please contact your system administrator.
                    </p>
                  </div>

=======
                  <!-- Warning -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; margin-bottom: 28px;">
                    <tr>
                      <td style="padding: 14px 16px;">
                        <p style="color: #b91c1c; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">⚠️ Security Reminder</p>
                        <p style="color: #dc2626; font-size: 13px; margin: 0; line-height: 1.5;">
                          Please log in and change your password immediately in <strong>My Profile → Change Password</strong> to keep your account secure.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
                    If you did not expect this change, please contact the system administrator immediately.
                  </p>
>>>>>>> 9fcf26fe3dfd1a44a219cc9b61d648eec0458d84
                </td>
              </tr>

              <!-- Footer -->
              <tr>
<<<<<<< HEAD
                <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">
                    🔒 Do not share your password with anyone!<br>
                    Keep your account secure.
                  </p>
                  <p style="color: #d1d5db; font-size: 11px; margin: 16px 0 0 0;">
                    © 2026 FPT University Room Booking System<br>
                    This is an automated email, please do not reply.
                  </p>
=======
                <td style="padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 FPT University Room Booking System</p>
                  <p style="color: #cbd5e1; font-size: 11px; margin: 6px 0 0 0;">This is an automated email, please do not reply.</p>
>>>>>>> 9fcf26fe3dfd1a44a219cc9b61d648eec0458d84
                </td>
              </tr>

            </table>
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
  accountCreatedTemplate,
  adminPasswordResetTemplate,
};
