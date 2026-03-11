const cron = require('node-cron');
const Booking = require('../models/Booking');
const { Notification } = require('../models');

const formatTime = (date) => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const sendUpcomingBookingReminders = async () => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = await Booking.find({
    status: 'APPROVED',
    date: today,
    start_time: {
      $gte: formatTime(new Date(now.getTime() + 50 * 60 * 1000)),
      $lte: formatTime(new Date(now.getTime() + 70 * 60 * 1000)),
    },
  })
    .populate('user_id', 'full_name')
    .populate('room_id', 'room_name location');

  let createdCount = 0;

  for (const booking of upcomingBookings) {
    const exists = await Notification.findOne({
      user_id: booking.user_id._id,
      type: 'REMINDER',
      target_id: booking._id,
      created_at: { $gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
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
        is_read: false,
      });

      createdCount += 1;
    }
  }

  return {
    scannedCount: upcomingBookings.length,
    createdCount,
  };
};

const startBookingReminderScheduler = () => {
  cron.schedule('*/30 * * * *', async () => {
    try {
      await sendUpcomingBookingReminders();
    } catch (error) {
      console.error('Booking reminder scheduler error:', error.message);
    }
  });

  console.log('Booking reminder scheduler started (every 30 mins)');
};

module.exports = { sendUpcomingBookingReminders, startBookingReminderScheduler };