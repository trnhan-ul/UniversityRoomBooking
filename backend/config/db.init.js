const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Setting } = require('../models');

const initDatabase = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ role: 'ADMIN' });
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      
      // Create admin user
      const admin = await User.create({
        email: 'admin@university.edu',
        password: hashedPassword,
        full_name: 'System Administrator',
        phone_number: '0123456789',
        role: 'ADMIN',
        status: 'ACTIVE'
      });
      
      console.log('✓ Default admin user created');
      console.log('  Email: admin@university.edu');
      console.log('  Password: Admin@123');
    }
    
    // Check if settings already exist
    const settingsCount = await Setting.countDocuments();
    
    if (settingsCount === 0) {
      console.log('Creating default system settings...');
      
      const defaultSettings = [
        {
          key: 'booking_start_time',
          value: '08:00',
          description: 'System booking start time',
          data_type: 'TIME'
        },
        {
          key: 'booking_end_time',
          value: '22:00',
          description: 'System booking end time',
          data_type: 'TIME'
        },
        {
          key: 'booking_slot_duration',
          value: '60',
          description: 'Booking slot duration in minutes',
          data_type: 'NUMBER'
        },
        {
          key: 'system_name',
          value: 'University Room Booking System',
          description: 'System name',
          data_type: 'STRING'
        },
        {
          key: 'max_advance_booking_days',
          value: '30',
          description: 'Maximum days in advance for booking',
          data_type: 'NUMBER'
        }
      ];
      
      await Setting.insertMany(defaultSettings);
      console.log('✓ Default system settings created');
    }
    
    console.log('✓ Database initialization completed');
    
  } catch (error) {
    console.error('✗ Database initialization error:', error);
    throw error;
  }
};

module.exports = initDatabase;
