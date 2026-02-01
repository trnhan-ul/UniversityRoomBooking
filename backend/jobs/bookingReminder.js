const cron = require('node-cron');
const Booking = require('../models/Booking');
const { Notification } = require('../models');

/**
 * Cron job: Gửi reminder trước 1 giờ khi booking sắp bắt đầu
 * Chạy mỗi 30 phút
 */
const startBookingReminderJob = () => {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      // Format time HH:mm
      const formatTime = (date) => {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      };
      
      const targetTime = formatTime(oneHourLater);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Tìm bookings APPROVED sẽ bắt đầu trong ~1 giờ tới
      const upcomingBookings = await Booking.find({
        status: 'APPROVED',
        date: today,
        start_time: {
          $gte: formatTime(new Date(now.getTime() + 50 * 60 * 1000)),
          $lte: formatTime(new Date(now.getTime() + 70 * 60 * 1000))
        }
      })
      .populate('user_id', 'full_name')
      .populate('room_id', 'room_name location');
      
      // Gửi reminder cho từng booking
      for (const booking of upcomingBookings) {
        // Check đã gửi chưa (tránh duplicate)
        const exists = await Notification.findOne({
          user_id: booking.user_id._id,
          type: 'REMINDER',
          target_id: booking._id,
          created_at: { $gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) }
        });
        
        if (!exists) {
          await Notification.create({
            user_id: booking.user_id._id,
            recipient_type: 'INDIVIDUAL',
            title: '⏰ Booking Reminder',
            message: `Your booking at ${booking.room_id.room_name} will start at ${booking.start_time}. Please arrive on time!`,
            type: 'REMINDER',
            target_type: 'Booking',
            target_id: booking._id,
            is_read: false
          });
        }
      }
    } catch (error) {
      console.error('Booking reminder error:', error.message);
    }
  });
  
  console.log('✅ Booking reminder job started (every 30 mins)');
};

module.exports = { startBookingReminderJob };
