const mongoose = require('mongoose');
require('dotenv').config();

const {
  User,
  Room,
  Setting,
  Booking,
  RoomSchedule,
  Equipment,
  RoomImage,
  Notification,
  AuditLog,
  EmailVerification,
  Holiday,
  FacilityIssue,
  PasswordReset,
} = require('./models');

const imageLibrary = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCWUiFU9aGgWn1znPY54fZ3mjgp2AaExSkppmVrNbrogN2J4zxrsjnRhm7Qf2PoQstCULNDh0fz2FroFWPiexZ5jDCU3voZvJg1xa3gKxD7BialuAowcYefNVDAgWSSNMp8sgqfb_BsELGv2kutm0Lsr98-UOWi68srT2QBVI8vv9ZqkZz3V0Wuy1uqIDg5-mgqZkrGajjYcjJ6z3JtdOovk65NjqH6UlbPb4yRaGzOCcba46HFAzHlO0KM8Y57s67-I-VWuQcnNHs',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBU8WjM-_Myu7YJELwBj3JI9VnbUsPCJ8qF6YY_l8oqho-uFYg6eXOpGQctnbCSbGOF1wLEnjyBAGrkXFIrX_53wxJbUilG1zW2Dhg9MGvMBZyxIuhyew53ceXy9tIynf6jUXSYvqFM1InSvFvtam111tjsxmU9zyT1xn2CBmRsJb3MrQ2BbB0LkMet6ONHPlTdYZKu-G9-TntrNLcc1tQVve8aE6zQNF1qciLhubWFbCLZQ_NQZE3ZJTRURQ3oyP-mBjO9L7EdF-0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBlwTjokCuO7115DTwtDwywW61aJ82qyedWC8quDals7xYGsvLSNRmdHuid3UmXK0Z4yM5lpclT34300Vti1WyM8Qji0bDJFn4hVmk-hyaehrZhx1_MzhdL_PJTl6XQp5OEScj_qhFaoOpY3lGCQSM0PUxJyUcv-xMCMGizy8uLK8oKUwSAXsNfeqBj3DPd7-faEizr6230Lw5rWf2KU1-4d-U9M7qIkFIRr7GzElf_-RR66ZoqJ8yph0KJOVufErVKKRqtQcd73sI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAX3Vs09lG6OYrQPDVXWSftUNI2rNBn_0E2kL_WdRZYqmZLjTem2SqACWzVUXD--oFklHQWMoswitWSeY7onNiyyYc4DF6Br7ChBxdF_cE02FyTRryHdEVWin6u7dHOK7MncJHVxAyh5SaD24AqImEbdLgcpRo6Bt-QTPdjLV-tzwD4JErdyDwqc_7su3K_kCwA24jzKbyu0MHGZ9wpvWEIiaZFLivolCulDbbhMf-wGXRMRFtGwGBYj8Spz_z1iFPM7pXCVxOhA20',
];

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const resetCollections = async () => {
  await AuditLog.deleteMany({});
  await Notification.deleteMany({});
  await FacilityIssue.deleteMany({});
  await PasswordReset.deleteMany({});
  await EmailVerification.deleteMany({});
  await RoomSchedule.deleteMany({});
  await RoomImage.deleteMany({});
  await Equipment.deleteMany({});
  await Booking.deleteMany({});
  await Holiday.deleteMany({});
  await Setting.deleteMany({});
  await Room.deleteMany({});
  await User.deleteMany({});
};

const seedUsers = async () => {
  const admin = await User.create({
    email: 'admin@fpt.edu.vn',
    password: 'Admin@123',
    full_name: 'System Administrator',
    phone_number: '0123456789',
    role: 'ADMINISTRATOR',
    status: 'ACTIVE',
    is_email_verified: true,
  });

  const manager = await User.create({
    email: 'manager@fpt.edu.vn',
    password: 'Manager@123',
    full_name: 'Le Van Manager',
    phone_number: '0945678901',
    role: 'FACILITY_MANAGER',
    status: 'ACTIVE',
    is_email_verified: true,
    created_by: admin._id,
    updated_by: admin._id,
  });

  const lecturer = await User.create({
    email: 'lecturer@fpt.edu.vn',
    password: 'Lecturer@123',
    full_name: 'Tran Thi Lecturer',
    phone_number: '0912345678',
    role: 'LECTURER',
    status: 'ACTIVE',
    is_email_verified: true,
    created_by: admin._id,
    updated_by: admin._id,
  });

  const student = await User.create({
    email: 'student@fpt.edu.vn',
    password: 'Student@123',
    full_name: 'Nguyen Van Student',
    phone_number: '0987654321',
    role: 'STUDENT',
    status: 'ACTIVE',
    is_email_verified: true,
    created_by: admin._id,
    updated_by: admin._id,
  });

  const studentTwo = await User.create({
    email: 'student2@fpt.edu.vn',
    password: 'Student2@123',
    full_name: 'Pham Minh Anh',
    phone_number: '0977665544',
    role: 'STUDENT',
    status: 'ACTIVE',
    is_email_verified: true,
    created_by: admin._id,
    updated_by: admin._id,
  });

  const pendingUser = await User.create({
    email: 'newuser@fpt.edu.vn',
    password: 'NewUser@123',
    full_name: 'Do Thi New User',
    phone_number: '0966887744',
    role: 'STUDENT',
    status: 'ACTIVE',
    is_email_verified: false,
    created_by: admin._id,
    updated_by: admin._id,
  });

  return { admin, manager, lecturer, student, studentTwo, pendingUser };
};

const seedSettings = async (adminId) => {
  return Setting.insertMany([
    {
      key: 'booking_start_time',
      value: '08:00',
      description: 'System booking start time',
      data_type: 'TIME',
      updated_by: adminId,
    },
    {
      key: 'booking_end_time',
      value: '22:00',
      description: 'System booking end time',
      data_type: 'TIME',
      updated_by: adminId,
    },
    {
      key: 'booking_slot_duration',
      value: '60',
      description: 'Booking slot duration in minutes',
      data_type: 'NUMBER',
      updated_by: adminId,
    },
    {
      key: 'max_advance_booking_days',
      value: '30',
      description: 'Maximum days in advance for booking',
      data_type: 'NUMBER',
      updated_by: adminId,
    },
    {
      key: 'system_name',
      value: 'University Room Booking System',
      description: 'System name',
      data_type: 'STRING',
      updated_by: adminId,
    },
    {
      key: 'allow_weekend_booking',
      value: 'false',
      description: 'Whether weekend bookings are allowed',
      data_type: 'BOOLEAN',
      updated_by: adminId,
    },
  ]);
};

const seedRooms = async (adminId, managerId) => {
  const rooms = await Room.insertMany([
    {
      room_code: 'A201',
      room_name: 'Conference Room A201',
      capacity: 30,
      location: 'Building A - Floor 2',
      description: 'Conference room for meetings and defense sessions.',
      status: 'AVAILABLE',
      created_by: adminId,
      updated_by: adminId,
    },
    {
      room_code: 'B105',
      room_name: 'Training Room B105',
      capacity: 25,
      location: 'Building B - Floor 1',
      description: 'Training room with flexible seating for workshops.',
      status: 'AVAILABLE',
      created_by: adminId,
      updated_by: managerId,
    },
    {
      room_code: 'A302',
      room_name: 'Seminar Room 302',
      capacity: 45,
      location: 'Building A - Floor 3',
      description: 'Modern seminar room with projector and whiteboard.',
      status: 'AVAILABLE',
      created_by: adminId,
      updated_by: managerId,
    },
    {
      room_code: 'C1-HALL',
      room_name: 'Grand Hall C1',
      capacity: 250,
      location: 'Building C - Floor 1',
      description: 'Large hall for talks, orientation, and special events.',
      status: 'MAINTENANCE',
      created_by: adminId,
      updated_by: managerId,
    },
    {
      room_code: 'D204',
      room_name: 'Computer Lab D204',
      capacity: 40,
      location: 'Building D - Floor 2',
      description: 'Computer laboratory with high-speed network access.',
      status: 'AVAILABLE',
      created_by: adminId,
      updated_by: managerId,
    },
    {
      room_code: 'E110',
      room_name: 'Innovation Studio E110',
      capacity: 20,
      location: 'Building E - Floor 1',
      description: 'Creative studio for group project collaboration.',
      status: 'UNAVAILABLE',
      created_by: adminId,
      updated_by: managerId,
    },
  ]);

  const roomImages = [];
  rooms.forEach((room, index) => {
    roomImages.push(
      {
        room_id: room._id,
        image_url: imageLibrary[index % imageLibrary.length],
        is_cover: true,
        uploaded_by: adminId,
      },
      {
        room_id: room._id,
        image_url: imageLibrary[(index + 1) % imageLibrary.length],
        is_cover: false,
        uploaded_by: adminId,
      }
    );
  });

  await RoomImage.insertMany(roomImages);
  return rooms;
};

const seedEquipment = async (rooms, adminId, managerId) => {
  const map = Object.fromEntries(rooms.map((room) => [room.room_code, room]));
  return Equipment.insertMany([
    { room_id: map.A201._id, name: 'Projector', quantity: 1, status: 'WORKING', description: 'Ceiling mounted projector', created_by: adminId, updated_by: managerId },
    { room_id: map.A201._id, name: 'Air Conditioning', quantity: 2, status: 'WORKING', description: 'Dual inverter AC', created_by: adminId, updated_by: managerId },
    { room_id: map.A201._id, name: 'Whiteboard', quantity: 1, status: 'WORKING', description: 'Large wall whiteboard', created_by: adminId, updated_by: managerId },
    { room_id: map.B105._id, name: 'Projector', quantity: 1, status: 'WORKING', description: 'Portable projector', created_by: adminId, updated_by: managerId },
    { room_id: map.B105._id, name: 'Air Conditioning', quantity: 1, status: 'WORKING', description: 'Central AC', created_by: adminId, updated_by: managerId },
    { room_id: map.B105._id, name: 'Speaker System', quantity: 1, status: 'WORKING', description: 'Stereo speaker set', created_by: adminId, updated_by: managerId },
    { room_id: map.A302._id, name: 'Projector', quantity: 1, status: 'WORKING', description: '4K projector', created_by: adminId, updated_by: managerId },
    { room_id: map.A302._id, name: 'Whiteboard', quantity: 2, status: 'WORKING', description: 'Sliding whiteboard', created_by: adminId, updated_by: managerId },
    { room_id: map['C1-HALL']._id, name: 'Main Screen', quantity: 1, status: 'MAINTENANCE', description: 'Hall projection screen under maintenance', created_by: adminId, updated_by: managerId },
    { room_id: map['C1-HALL']._id, name: 'Microphone System', quantity: 4, status: 'WORKING', description: 'Wireless microphones', created_by: adminId, updated_by: managerId },
    { room_id: map.D204._id, name: 'Computer Workstations', quantity: 40, status: 'WORKING', description: 'Student desktop computers', created_by: adminId, updated_by: managerId },
    { room_id: map.D204._id, name: 'Projector', quantity: 1, status: 'WORKING', description: 'Teaching projector', created_by: adminId, updated_by: managerId },
    { room_id: map.E110._id, name: 'Interactive Display', quantity: 1, status: 'BROKEN', description: 'Touch display waiting for replacement', created_by: adminId, updated_by: managerId },
  ]);
};

const seedBookings = async (users, rooms) => {
  const now = new Date();
  const roomMap = Object.fromEntries(rooms.map((room) => [room.room_code, room]));
  const weeklySeriesId = 'WEEKLY-A201-LECTURER-001';

  return Booking.insertMany([
    {
      user_id: users.student._id,
      room_id: roomMap.A201._id,
      date: addDays(now, 1),
      start_time: '09:00',
      end_time: '11:00',
      purpose: 'Capstone project presentation rehearsal',
      status: 'APPROVED',
      approved_by: users.manager._id,
      approved_at: addDays(now, -1),
      qr_code_token: 'QR-BOOKING-A201-APPROVED',
      recurrence_type: 'NONE',
    },
    {
      user_id: users.lecturer._id,
      room_id: roomMap.B105._id,
      date: addDays(now, 2),
      start_time: '13:00',
      end_time: '15:00',
      purpose: 'Teaching assistant workshop',
      status: 'PENDING',
      qr_code_token: 'QR-BOOKING-B105-PENDING',
      recurrence_type: 'NONE',
    },
    {
      user_id: users.studentTwo._id,
      room_id: roomMap.D204._id,
      date: addDays(now, -2),
      start_time: '10:00',
      end_time: '12:00',
      purpose: 'Programming lab practice',
      status: 'CHECKED-IN',
      approved_by: users.manager._id,
      approved_at: addDays(now, -4),
      qr_code_token: 'QR-BOOKING-D204-CHECKEDIN',
      checked_in_at: addDays(now, -2),
      check_in_type: 'ON_TIME',
      recurrence_type: 'NONE',
    },
    {
      user_id: users.student._id,
      room_id: roomMap.A302._id,
      date: addDays(now, -1),
      start_time: '14:00',
      end_time: '16:00',
      purpose: 'English club seminar',
      status: 'REJECTED',
      approved_by: users.manager._id,
      approved_at: addDays(now, -2),
      reject_reason: 'Room reserved for department meeting.',
      qr_code_token: 'QR-BOOKING-A302-REJECTED',
      recurrence_type: 'NONE',
    },
    {
      user_id: users.lecturer._id,
      room_id: roomMap.A201._id,
      date: addDays(now, 7),
      start_time: '08:00',
      end_time: '10:00',
      purpose: 'Weekly thesis advising session',
      status: 'APPROVED',
      approved_by: users.manager._id,
      approved_at: now,
      qr_code_token: 'QR-BOOKING-WEEKLY-001',
      recurrence_id: weeklySeriesId,
      recurrence_type: 'WEEKLY',
    },
    {
      user_id: users.lecturer._id,
      room_id: roomMap.A201._id,
      date: addDays(now, 14),
      start_time: '08:00',
      end_time: '10:00',
      purpose: 'Weekly thesis advising session',
      status: 'APPROVED',
      approved_by: users.manager._id,
      approved_at: now,
      qr_code_token: 'QR-BOOKING-WEEKLY-002',
      recurrence_id: weeklySeriesId,
      recurrence_type: 'WEEKLY',
    },
    {
      user_id: users.studentTwo._id,
      room_id: roomMap.E110._id,
      date: addDays(now, 3),
      start_time: '15:00',
      end_time: '17:00',
      purpose: 'Design thinking group work',
      status: 'CANCELLED',
      qr_code_token: 'QR-BOOKING-E110-CANCELLED',
      recurrence_type: 'NONE',
    },
  ]);
};

const seedSchedules = async (rooms, managerId) => {
  const now = new Date();
  const roomMap = Object.fromEntries(rooms.map((room) => [room.room_code, room]));
  return RoomSchedule.insertMany([
    {
      room_id: roomMap['C1-HALL']._id,
      date: addDays(now, 5),
      start_time: '08:00',
      end_time: '17:00',
      status: 'MAINTENANCE',
      reason: 'Audio and stage lighting inspection.',
      created_by: managerId,
      updated_by: managerId,
    },
    {
      room_id: roomMap.A302._id,
      date: addDays(now, 4),
      start_time: '13:00',
      end_time: '17:00',
      status: 'EVENT',
      reason: 'Department workshop reserved by administration.',
      created_by: managerId,
      updated_by: managerId,
    },
    {
      room_id: roomMap.D204._id,
      date: addDays(now, 6),
      start_time: '07:00',
      end_time: '09:00',
      status: 'BLOCKED',
      reason: 'Network maintenance before morning lab sessions.',
      created_by: managerId,
      updated_by: managerId,
    },
  ]);
};

const seedHolidays = async (adminId) => {
  const year = new Date().getFullYear();
  return Holiday.insertMany([
    {
      name: 'Hung Kings Commemoration Day',
      date: new Date(`${year}-04-07T00:00:00.000Z`),
      description: 'National holiday in Vietnam.',
      isRecurring: true,
      createdBy: adminId,
    },
    {
      name: 'Reunification Day',
      date: new Date(`${year}-04-30T00:00:00.000Z`),
      description: 'Public holiday.',
      isRecurring: true,
      createdBy: adminId,
    },
    {
      name: 'National Day',
      date: new Date(`${year}-09-02T00:00:00.000Z`),
      description: 'Public holiday.',
      isRecurring: true,
      createdBy: adminId,
    },
  ]);
};

const seedNotifications = async (users, bookings, issues) => {
  const [approvedBooking, pendingBooking, checkedInBooking, rejectedBooking] = bookings;
  const [facilityIssue] = issues;

  return Notification.insertMany([
    {
      user_id: users.student._id,
      title: 'Booking Approved',
      message: 'Your booking for Conference Room A201 has been approved.',
      type: 'BOOKING',
      recipient_type: 'INDIVIDUAL',
      is_read: false,
      target_type: 'Booking',
      target_id: approvedBooking._id,
    },
    {
      user_id: users.lecturer._id,
      title: 'Approval Pending',
      message: 'Your booking request for Training Room B105 is waiting for approval.',
      type: 'BOOKING',
      recipient_type: 'INDIVIDUAL',
      is_read: false,
      target_type: 'Booking',
      target_id: pendingBooking._id,
    },
    {
      user_id: users.studentTwo._id,
      title: 'Booking Confirmed',
      message: 'You have successfully checked in to Computer Lab D204.',
      type: 'BOOKING',
      recipient_type: 'INDIVIDUAL',
      is_read: true,
      target_type: 'Booking',
      target_id: checkedInBooking._id,
    },
    {
      user_id: users.student._id,
      title: 'Booking Rejected',
      message: 'Your request for Seminar Room 302 was rejected because the room is reserved.',
      type: 'BOOKING',
      recipient_type: 'INDIVIDUAL',
      is_read: false,
      target_type: 'Booking',
      target_id: rejectedBooking._id,
    },
    {
      recipient_type: 'ALL_USERS',
      title: 'Campus Announcement',
      message: 'Room booking system maintenance will take place this weekend.',
      type: 'SYSTEM',
      read_by: [users.admin._id],
      target_type: 'Room',
    },
    {
      user_id: users.manager._id,
      title: 'Facility issue reported',
      message: 'A new equipment damage issue was reported for Computer Lab D204.',
      type: 'FACILITY_ISSUE',
      recipient_type: 'INDIVIDUAL',
      is_read: false,
      target_type: 'FacilityIssue',
      target_id: facilityIssue._id,
    },
  ]);
};

const seedFacilityIssues = async (users, bookings, equipment) => {
  const equipmentMap = Object.fromEntries(equipment.map((item) => [`${item.room_id.toString()}-${item.name}`, item]));
  const checkedInBooking = bookings.find((booking) => booking.status === 'CHECKED-IN');
  const approvedBooking = bookings.find((booking) => booking.status === 'APPROVED');

  return FacilityIssue.insertMany([
    {
      booking_id: checkedInBooking._id,
      room_id: checkedInBooking.room_id,
      reported_by: users.studentTwo._id,
      issue_type: 'EQUIPMENT_DAMAGE',
      equipment_id: equipmentMap[`${checkedInBooking.room_id.toString()}-Computer Workstations`]?._id || null,
      title: 'One workstation cannot boot',
      description: 'Desktop number 12 in the back row stays on a black screen after power on.',
      severity: 'HIGH',
      status: 'IN_PROGRESS',
      location: 'Back row, seat 12',
      admin_notes: 'Technician assigned for inspection.',
    },
    {
      booking_id: approvedBooking._id,
      room_id: approvedBooking.room_id,
      reported_by: users.student._id,
      issue_type: 'CLEANLINESS',
      title: 'Room needs cleaning before next session',
      description: 'The floor area near the podium had visible trash after the previous event.',
      severity: 'LOW',
      status: 'REPORTED',
      location: 'Front podium area',
    },
  ]);
};

const seedAuditLogs = async (users, rooms, bookings, settings, equipment) => {
  return AuditLog.insertMany([
    {
      user_id: users.admin._id,
      action: 'CREATE',
      target_type: 'User',
      target_id: users.manager._id,
      description: 'Created facility manager account manager@fpt.edu.vn',
      ip_address: '127.0.0.1',
      user_agent: 'seed-script',
    },
    {
      user_id: users.admin._id,
      action: 'CREATE',
      target_type: 'Room',
      target_id: rooms[0]._id,
      description: 'Created room Conference Room A201',
      ip_address: '127.0.0.1',
      user_agent: 'seed-script',
    },
    {
      user_id: users.manager._id,
      action: 'APPROVE',
      target_type: 'Booking',
      target_id: bookings[0]._id,
      description: 'Approved booking for Nguyen Van Student in room A201',
      ip_address: '127.0.0.1',
      user_agent: 'seed-script',
    },
    {
      user_id: users.manager._id,
      action: 'REJECT',
      target_type: 'Booking',
      target_id: bookings[3]._id,
      description: 'Rejected booking due to room conflict.',
      ip_address: '127.0.0.1',
      user_agent: 'seed-script',
    },
    {
      user_id: users.admin._id,
      action: 'UPDATE',
      target_type: 'Setting',
      target_id: settings[0]._id,
      description: 'Updated booking start time setting.',
      ip_address: '127.0.0.1',
      user_agent: 'seed-script',
    },
    {
      user_id: users.manager._id,
      action: 'UPDATE',
      target_type: 'Equipment',
      target_id: equipment[8]._id,
      description: 'Marked Main Screen as under maintenance.',
      ip_address: '127.0.0.1',
      user_agent: 'seed-script',
    },
  ]);
};

const seedAuthArtifacts = async (users) => {
  const now = new Date();

  await EmailVerification.create({
    user_id: users.pendingUser._id,
    token: 'VERIFY-TOKEN-NEWUSER-001',
    expires_at: addDays(now, 2),
    verified_at: null,
  });

  await PasswordReset.create({
    user_id: users.lecturer._id,
    token: 'RESET-TOKEN-LECTURER-001',
    expires_at: addDays(now, 1),
    is_used: false,
  });
};

const main = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/university-booking';

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await resetCollections();
    console.log('Existing data cleared');

    const users = await seedUsers();
    const settings = await seedSettings(users.admin._id);
    const rooms = await seedRooms(users.admin._id, users.manager._id);
    const equipment = await seedEquipment(rooms, users.admin._id, users.manager._id);
    const bookings = await seedBookings(users, rooms);
    await seedSchedules(rooms, users.manager._id);
    await seedHolidays(users.admin._id);
    const issues = await seedFacilityIssues(users, bookings, equipment);
    await seedNotifications(users, bookings, issues);
    await seedAuditLogs(users, rooms, bookings, settings, equipment);
    await seedAuthArtifacts(users);

    console.log('Sample database created successfully');
    console.log('Accounts ready for login:');
    console.log('ADMINISTRATOR: admin@fpt.edu.vn / Admin@123');
    console.log('FACILITY_MANAGER: manager@fpt.edu.vn / Manager@123');
    console.log('LECTURER: lecturer@fpt.edu.vn / Lecturer@123');
    console.log('STUDENT: student@fpt.edu.vn / Student@123');
    console.log('STUDENT: student2@fpt.edu.vn / Student2@123');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

main();