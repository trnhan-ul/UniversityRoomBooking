// Constants for the application

// User Roles
const USER_ROLES = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN'
};

// User Status
const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

// Room Status
const ROOM_STATUS = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE'
};

// Setting Data Types
const SETTING_DATA_TYPES = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  TIME: 'TIME'
};

// Password Reset Token Expiry (in hours)
const PASSWORD_RESET_EXPIRY = 1;

// JWT Token Expiry
const JWT_EXPIRY = '7d';

module.exports = {
  USER_ROLES,
  USER_STATUS,
  ROOM_STATUS,
  SETTING_DATA_TYPES,
  PASSWORD_RESET_EXPIRY,
  JWT_EXPIRY
};
