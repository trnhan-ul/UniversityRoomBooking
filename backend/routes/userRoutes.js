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
} = require("../controllers/userController");

// Danh sách role hợp lệ (để FE sử dụng form chọn role)
router.get("/roles", getAvailableRoles);

// All routes below require authentication and ADMIN role
router.use(authenticate);
router.use(authorizeRoles(["ADMINISTRATOR"]));

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
