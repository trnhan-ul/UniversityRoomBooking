const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const {
  getAllSettings,
  getWorkingHours,
  updateWorkingHours,
  getSettingByKey,
  updateSetting
} = require('../controllers/settingController');

// ============================================
// WORKING HOURS ROUTES
// ============================================

// Get working hours (Public - for booking validation)
router.get('/working-hours', getWorkingHours);

// Update working hours (Admin/Facility Manager only)
router.put(
  '/working-hours',
  authenticate,
  authorizeRoles('ADMIN', 'FACILITY_MANAGER'),
  updateWorkingHours
);

// ============================================
// GENERAL SETTINGS ROUTES
// ============================================

// Get all settings (Admin only)
router.get(
  '/',
  authenticate,
  authorizeRoles('ADMIN', 'FACILITY_MANAGER'),
  getAllSettings
);

// Get setting by key (Admin only)
router.get(
  '/:key',
  authenticate,
  authorizeRoles('ADMIN', 'FACILITY_MANAGER'),
  getSettingByKey
);

// Update setting by key (Admin only)
router.put(
  '/:key',
  authenticate,
  authorizeRoles('ADMIN', 'FACILITY_MANAGER'),
  updateSetting
);

module.exports = router;
