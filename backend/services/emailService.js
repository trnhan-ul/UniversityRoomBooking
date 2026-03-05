const nodemailer = require('nodemailer');
const { bookingApprovalTemplate, accountCreatedTemplate } = require('../templates/emailTemplates');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendApprovalEmail = async (user, booking, room, status, rejectReason = null) => {
  try {
    const isApproved = status === 'APPROVED';
    const subject = isApproved 
      ? '✅ Your Booking Has Been Approved'
      : '❌ Your Booking Has Been Rejected';

    const htmlContent = bookingApprovalTemplate(booking, room, status, rejectReason);

    const mailOptions = {
      from: `"Room Booking System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${user.email} for booking ${booking._id}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Gửi email chào mừng khi tạo tài khoản mới
 * @param {Object} userData - {email, password, full_name, role, phone_number}
 */
const sendAccountCreatedEmail = async (userData) => {
  try {
    const htmlContent = accountCreatedTemplate(userData);

    const mailOptions = {
      from: `"UniBooking - FPT University" <${process.env.EMAIL_USER}>`,
      to: userData.email,
      subject: '🎓 Welcome to UniBooking - Your Account Has Been Created',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Account creation email sent to ${userData.email}`);
    return true;
  } catch (error) {
    console.error('Error sending account created email:', error);
    return false;
  }
};

module.exports = {
  sendApprovalEmail,
  sendAccountCreatedEmail,
};
