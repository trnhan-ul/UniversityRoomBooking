const express = require('express');
const router = express.Router();
const facilityIssueController = require('../controllers/facilityIssueController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// POST /api/facility-issues - Create a new facility issue (Student, Lecturer)
router.post(
  '/',
  authenticate,
  authorizeRoles(['STUDENT', 'LECTURER']),
  facilityIssueController.createFacilityIssue
);

// GET /api/facility-issues - Get all facility issues (Admin only)
router.get(
  '/',
  authenticate,
  authorizeRoles(['ADMINISTRATOR', 'FACILITY_MANAGER']),
  facilityIssueController.getAllFacilityIssues
);

// GET /api/facility-issues/my-issues - Get current user's facility issues
router.get(
  '/my-issues',
  authenticate,
  authorizeRoles(['STUDENT', 'LECTURER']),
  facilityIssueController.getMyFacilityIssues
);

// GET /api/facility-issues/stats - Get facility issue statistics (Admin only)
router.get(
  '/stats',
  authenticate,
  authorizeRoles(['ADMINISTRATOR', 'FACILITY_MANAGER']),
  facilityIssueController.getFacilityIssueStats
);

// GET /api/facility-issues/:id - Get a specific facility issue by ID
router.get(
  '/:id',
  authenticate,
  facilityIssueController.getFacilityIssueById
);

// PUT /api/facility-issues/:id/status - Update facility issue status (Admin only)
router.put(
  '/:id/status',
  authenticate,
  authorizeRoles(['ADMINISTRATOR', 'FACILITY_MANAGER']),
  facilityIssueController.updateFacilityIssueStatus
);

// DELETE /api/facility-issues/:id - Delete a facility issue (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorizeRoles(['ADMINISTRATOR', 'FACILITY_MANAGER']),
  facilityIssueController.deleteFacilityIssue
);

module.exports = router;
