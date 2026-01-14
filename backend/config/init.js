const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User, Setting } = require("../models");

const initDatabase = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ role: "ADMINISTRATOR" });

    if (!adminExists) {
      // Create administrator user (password sẽ tự động hash nhờ pre('save') hook)
      const admin = await User.create({
        email: "admin@fpt.edu.vn",
        password: "Admin@123",
        full_name: "System Administrator",
        phone_number: "0123456789",
        role: "ADMINISTRATOR",
        status: "ACTIVE",
        is_email_verified: true,
      });
      console.log("Administrator user created successfully");
    }

    // Create sample users for testing
    const studentExists = await User.findOne({ role: "STUDENT" });
    if (!studentExists) {
      await User.create({
        email: "student@fpt.edu.vn",
        password: "Student@123",
        full_name: "Nguyen Van Student",
        phone_number: "0987654321",
        role: "STUDENT",
        status: "ACTIVE",
        is_email_verified: true,
      });
      console.log("Sample student created successfully");
    }

    const lecturerExists = await User.findOne({ role: "LECTURER" });
    if (!lecturerExists) {
      await User.create({
        email: "lecturer@fpt.edu.vn",
        password: "Lecturer@123",
        full_name: "Tran Thi Lecturer",
        phone_number: "0912345678",
        role: "LECTURER",
        status: "ACTIVE",
        is_email_verified: true,
      });
      console.log("Sample lecturer created successfully");
    }

    const managerExists = await User.findOne({ role: "FACILITY_MANAGER" });
    if (!managerExists) {
      await User.create({
        email: "manager@fpt.edu.vn",
        password: "Manager@123",
        full_name: "Le Van Manager",
        phone_number: "0945678901",
        role: "FACILITY_MANAGER",
        status: "ACTIVE",
        is_email_verified: true,
      });
      console.log("Sample facility manager created successfully");
    }

    // Check if settings already exist
    const settingsCount = await Setting.countDocuments();

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
