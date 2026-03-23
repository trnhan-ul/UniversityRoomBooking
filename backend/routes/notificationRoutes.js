const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/notifications - Get all notifications with filters and pagination
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// PUT /api/notifications/:id/read - Mark single notification as read
router.put('/:id/read', notificationController.markAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Admin only - Send system notification to all users
// POST /api/notifications/system-broadcast - Send to all users
router.post(
  "/system-broadcast",
  authorizeRoles("ADMINISTRATOR"),
  notificationController.sendSystemBroadcast,
);

module.exports = router;
