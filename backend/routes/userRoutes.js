const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const {
  getUserById,
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getAvailableRoles,
  getMyProfile,
  updateMyProfile,
  changePassword,
  adminResetPassword,
} = require("../controllers/userController");


router.get("/roles", getAvailableRoles);

// ============================================
// USER PROFILE ROUTES (Self-Service)
// ============================================
// These routes allow authenticated users to manage their own profile
router.get('/me', authenticate, getMyProfile);
router.put('/me', authenticate, updateMyProfile);
router.put('/me/password', authenticate, changePassword);


router.use(authenticate);
router.use(authorizeRoles(["ADMINISTRATOR"]));

// Get all users with filters
router.get('/', getAllUsers);

// UC41: View User Detail
router.get('/:id', getUserById);


router.post('/', createUser);


router.patch('/:id', updateUser);

// Admin reset password for a user
router.patch('/:id/reset-password', adminResetPassword);


router.delete('/:id', deleteUser);

module.exports = router;
