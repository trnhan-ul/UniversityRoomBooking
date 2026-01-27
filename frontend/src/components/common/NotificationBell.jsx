import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnreadCount, fetchNotifications, markAsRead } from '../../services/notificationService';
import NotificationItem from './NotificationItem';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      if (response.success) {
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch recent notifications (top 5)
  const fetchRecent = async () => {
    try {
      setLoading(true);
      const response = await fetchNotifications({ page: 1, limit: 5 });
      if (response.success && response.notifications) {
        setRecentNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isOpen) {
      fetchRecent();
    }
    setIsOpen(!isOpen);
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await markAsRead(notification._id);
        fetchUnreadCount(); // Update count
      }

      // Navigate to related page
      if (notification.type === 'BOOKING' && notification.target_id) {
        navigate(`/bookings/${notification.target_id}`);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  // View all notifications
  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch unread count on mount and set polling
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span className="material-symbols-outlined text-2xl">
          notifications
        </span>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({unreadCount} unread)
                  </span>
                )}
              </h3>
              <button
                onClick={handleViewAll}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold"
              >
                View All
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300">
                  notifications_off
                </span>
                <p className="text-sm text-gray-500 mt-2">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <div key={notification._id} className="px-2 py-1">
                    <NotificationItem
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={handleViewAll}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-bold"
              >
                View All Notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
