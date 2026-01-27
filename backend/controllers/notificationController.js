const { Notification } = require('../models');
const mongoose = require('mongoose');

// Get all notifications for current user with filters and pagination
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter query - get notifications for:
    // 1. Individual notifications for this user
    // 2. Broadcast to all users (not yet read by this user)
    const filter = {
      $or: [
        { user_id: userId, recipient_type: 'INDIVIDUAL' },
        { recipient_type: 'ALL_USERS' }
      ]
    };

    // Filter by type (BOOKING, SYSTEM, REMINDER)
    if (req.query.type) {
      filter.type = req.query.type.toUpperCase();
    }

    // Filter by read status
    if (req.query.is_read !== undefined) {
      const isRead = req.query.is_read === 'true';
      // For individual: check is_read
      // For broadcast: check if userId in read_by array
      filter.$and = [
        {
          $or: [
            { recipient_type: 'INDIVIDUAL', is_read: isRead },
            { recipient_type: 'ALL_USERS', read_by: isRead ? { $in: [userId] } : { $nin: [userId] } }
          ]
        }
      ];
    }

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .then(notifs => {
          // Add computed is_read field for broadcast notifications
          return notifs.map(n => ({
            ...n,
            is_read: n.recipient_type === 'ALL_USERS' 
              ? n.read_by.some(id => id.toString() === userId.toString())
              : n.is_read
          }));
        }),
      Notification.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Notification.countDocuments({
      $or: [
        { user_id: userId, recipient_type: 'INDIVIDUAL', is_read: false },
        { recipient_type: 'ALL_USERS', read_by: { $nin: [userId] } }
      ]
    });

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Mark single notification as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    // Find notification and verify access
    const notification = await Notification.findOne({
      _id: notificationId,
      $or: [
        { user_id: userId, recipient_type: 'INDIVIDUAL' },
        { recipient_type: 'ALL_USERS' }
      ]
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied'
      });
    }

    // Mark as read based on recipient type
    if (notification.recipient_type === 'INDIVIDUAL') {
      notification.is_read = true;
    } else if (notification.recipient_type === 'ALL_USERS') {
      // Add user to read_by array if not already there
      if (!notification.read_by.includes(userId)) {
        notification.read_by.push(userId);
      }
    }
    
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    // Update individual notifications
    const individualResult = await Notification.updateMany(
      {
        user_id: userId,
        recipient_type: 'INDIVIDUAL',
        is_read: false
      },
      {
        $set: { is_read: true }
      }
    );

    // Update broadcast notifications - add user to read_by array
    const broadcastResult = await Notification.updateMany(
      {
        recipient_type: 'ALL_USERS',
        read_by: { $nin: [userId] }
      },
      {
        $addToSet: { read_by: userId }
      }
    );

    const totalUpdated = individualResult.modifiedCount + broadcastResult.modifiedCount;

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: totalUpdated
    });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    // Find and delete notification (only individual notifications can be deleted)
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user_id: userId,
      recipient_type: 'INDIVIDUAL'
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('deleteNotification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Admin: Send system notification to all users
const sendSystemBroadcast = async (req, res) => {
  try {
    const { title, message } = req.body;
    
    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }
    
    // Create ONE notification with recipient_type = ALL_USERS
    const notification = await Notification.create({
      recipient_type: 'ALL_USERS',
      title,
      message,
      type: 'SYSTEM',
      read_by: [] // Empty array - no one has read yet
    });
    
    res.status(201).json({
      success: true,
      message: 'System notification sent to all users',
      notification
    });
  } catch (error) {
    console.error('sendSystemBroadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send system notification',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendSystemBroadcast
};
