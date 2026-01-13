const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Setting, Role } = require("../models");

const initDatabase = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ role: "ADMIN" });

    if (!adminExists) {
      // Create admin user (password sẽ tự động hash nhờ pre('save') hook)
      const admin = await User.create({
        email: "admin@fpt.edu.vn",
        password: "Admin@123",
        full_name: "System Administrator",
        phone_number: "0123456789",
        role: "ADMIN",
        status: "ACTIVE",
      });
      console.log("Admin user created successfully");
    }

    // Check if settings already exist
    const settingsCount = await Setting.countDocuments();

    // Seed roles if not exist
    const rolesCount = await Role.countDocuments();
    if (rolesCount === 0) {
      const defaultRoles = [
        { name: "STUDENT", description: "Student role" },
        { name: "TEACHER", description: "Teacher role" },
        { name: "STAFF", description: "Staff role" },
        { name: "ADMIN", description: "System administrator" },
      ];

      await Role.insertMany(defaultRoles);
      console.log("Default roles seeded");
    }

    if (settingsCount === 0) {
      const defaultSettings = [
        {
          key: "booking_start_time",
          value: "08:00",
          description: "System booking start time",
          data_type: "TIME",
        },
        {
          key: "booking_end_time",
          value: "22:00",
          description: "System booking end time",
          data_type: "TIME",
        },
        {
          key: "booking_slot_duration",
          value: "60",
          description: "Booking slot duration in minutes",
          data_type: "NUMBER",
        },
        {
          key: "system_name",
          value: "University Room Booking System",
          description: "System name",
          data_type: "STRING",
        },
        {
          key: "max_advance_booking_days",
          value: "30",
          description: "Maximum days in advance for booking",
          data_type: "NUMBER",
        },
      ];

      await Setting.insertMany(defaultSettings);
    }
  } catch (error) {
    throw error;
  }
};

module.exports = initDatabase;
