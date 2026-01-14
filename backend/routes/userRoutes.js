const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const {
  getUserById,
  createUser,
  getAllUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// All routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

// Get all users with filters
router.get('/', getAllUsers);

// UC41: View User Detail
router.get('/:id', getUserById);

// UC42: Create User
router.post('/', createUser);

// Update user
router.patch('/:id', updateUser);

// Delete user (soft delete)
router.delete('/:id', deleteUser);

module.exports = router;
