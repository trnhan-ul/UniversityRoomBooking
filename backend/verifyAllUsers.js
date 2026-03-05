// Script to verify all existing users created by admin
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const verifyAllUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all users to verified
    const result = await User.updateMany(
      { is_email_verified: false },
      { $set: { is_email_verified: true } }
    );

    console.log(`Updated ${result.modifiedCount} users to verified status`);

    // Show all users
    const users = await User.find().select('email full_name is_email_verified');
    console.log('\nAll users:');
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.full_name} (Verified: ${user.is_email_verified})`);
    });

    mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyAllUsers();
