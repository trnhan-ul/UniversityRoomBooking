const mongoose = require('mongoose');
const Room = require('./models/Room');
const Equipment = require('./models/Equipment');
const User = require('./models/User');
require('dotenv').config();

const seedRooms = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-booking');
    console.log('✅ Connected to MongoDB');

    // Find admin user to set as creator
    let adminUser = await User.findOne({ role: 'ADMINISTRATOR' });
    
    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating default admin...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = await User.create({
        email: 'admin@university.edu',
        password: hashedPassword,
        full_name: 'System Admin',
        role: 'ADMINISTRATOR',
        status: 'ACTIVE',
        is_email_verified: true
      });
      console.log('✅ Admin user created');
    }

    // Clear existing data
    await Room.deleteMany({});
    await Equipment.deleteMany({});
    console.log('🗑️  Cleared existing rooms and equipment');

    // Room data matching the mock data
    const roomsData = [
      {
        room_code: 'A302',
        room_name: 'Seminar Room 302',
        location: 'Bldg A, 3rd Floor',
        capacity: 45,
        description: 'Modern seminar room with projector and whiteboard',
        status: 'AVAILABLE',
        created_by: adminUser._id
      },
      {
        room_code: 'C1-HALL',
        room_name: 'Grand Hall C1',
        location: 'Bldg C, 1st Floor',
        capacity: 250,
        description: 'Large auditorium for major events',
        status: 'AVAILABLE',
        created_by: adminUser._id
      },
      {
        room_code: 'B204',
        room_name: 'IT Lab 204',
        location: 'Bldg B, 2nd Floor',
        capacity: 30,
        description: 'Computer lab with workstations',
        status: 'AVAILABLE',
        created_by: adminUser._id
      },
      {
        room_code: 'ARTS-1',
        room_name: 'Creative Studio 1',
        location: 'Arts Annex',
        capacity: 20,
        description: 'Art studio with natural lighting',
        status: 'UNAVAILABLE',
        created_by: adminUser._id
      },
      {
        room_code: 'A101',
        room_name: 'Lecture Hall A-101',
        location: 'Bldg A, 1st Floor',
        capacity: 120,
        description: 'Large lecture hall with multimedia equipment',
        status: 'AVAILABLE',
        created_by: adminUser._id
      },
      {
        room_code: 'B305',
        room_name: 'Science Lab 305',
        location: 'Bldg B, 3rd Floor',
        capacity: 35,
        description: 'Chemistry and biology laboratory',
        status: 'AVAILABLE',
        created_by: adminUser._id
      }
    ];

    // Insert rooms
    const insertedRooms = await Room.insertMany(roomsData);
    console.log(`✅ Created ${insertedRooms.length} rooms`);

    // Equipment data
    const equipmentData = [
      // Seminar Room 302
      { room_id: insertedRooms[0]._id, name: 'Projector', quantity: 1, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[0]._id, name: 'Air Conditioning', quantity: 2, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[0]._id, name: 'Whiteboard', quantity: 1, status: 'WORKING', created_by: adminUser._id },
      
      // Grand Hall C1
      { room_id: insertedRooms[1]._id, name: 'Projector', quantity: 2, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[1]._id, name: 'Air Conditioning', quantity: 4, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[1]._id, name: 'Sound System', quantity: 1, status: 'WORKING', created_by: adminUser._id },
      
      // IT Lab 204
      { room_id: insertedRooms[2]._id, name: 'Projector', quantity: 1, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[2]._id, name: 'Air Conditioning', quantity: 2, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[2]._id, name: 'Computer Workstations', quantity: 30, status: 'WORKING', created_by: adminUser._id },
      
      // Creative Studio 1
      { room_id: insertedRooms[3]._id, name: 'Natural Light Windows', quantity: 4, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[3]._id, name: 'Whiteboard', quantity: 2, status: 'WORKING', created_by: adminUser._id },
      
      // Lecture Hall A-101
      { room_id: insertedRooms[4]._id, name: 'Projector', quantity: 2, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[4]._id, name: 'Air Conditioning', quantity: 3, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[4]._id, name: 'Microphone System', quantity: 1, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[4]._id, name: 'Document Camera', quantity: 1, status: 'WORKING', created_by: adminUser._id },
      
      // Science Lab 305
      { room_id: insertedRooms[5]._id, name: 'Projector', quantity: 1, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[5]._id, name: 'Air Conditioning', quantity: 2, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[5]._id, name: 'Lab Equipment Set', quantity: 12, status: 'WORKING', created_by: adminUser._id },
      { room_id: insertedRooms[5]._id, name: 'Fume Hood', quantity: 4, status: 'WORKING', created_by: adminUser._id }
    ];

    const insertedEquipment = await Equipment.insertMany(equipmentData);
    console.log(`✅ Created ${insertedEquipment.length} equipment items`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Rooms: ${insertedRooms.length}`);
    console.log(`   - Equipment: ${insertedEquipment.length}`);
    console.log(`   - Admin User: ${adminUser.email}`);
    console.log('\n💡 You can now login with:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: admin123`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run seed
seedRooms();
