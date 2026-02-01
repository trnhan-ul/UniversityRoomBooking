const nodemailer = require('nodemailer');
const { bookingApprovalTemplate } = require('../templates/emailTemplates');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
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

module.exports = {
  sendApprovalEmail,
};
