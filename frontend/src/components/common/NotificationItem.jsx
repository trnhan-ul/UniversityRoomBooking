import React from 'react';

const NotificationItem = ({ 
  notification, 
  onClick, 
  onDelete,
  showDelete = false 
}) => {
  const getNotificationIcon = (type, title) => {
    // Check if rejected notification
    if (title && title.toLowerCase().includes('reject')) {
      return 'cancel';
    }
    
    // Check for specific keywords
    if (title && title.toLowerCase().includes('confirm')) {
      return 'check_circle';
    }
    
    if (title && title.toLowerCase().includes('maintenance')) {
      return 'warning';
    }
    
    if ((title && title.toLowerCase().includes('open')) || (title && title.toLowerCase().includes('announcement'))) {
      return 'campaign';
    }
    
    const icons = {
      BOOKING: 'event',
      SYSTEM: 'settings',
      REMINDER: 'alarm'
    };
    return icons[type] || 'notifications';
  };

  const getIconColor = (type, title) => {
    // Check if rejected notification - use red color
    if (title && title.toLowerCase().includes('reject')) {
      return 'text-red-600 bg-red-100';
    }
    
    // Check for confirmed - use green
    if (title && title.toLowerCase().includes('confirm')) {
      return 'text-green-600 bg-green-100';
    }
    
    // Check for maintenance/warning - use yellow
    if (title && title.toLowerCase().includes('maintenance')) {
      return 'text-yellow-600 bg-yellow-100';
    }
    
    // Check for announcements - use purple
    if ((title && title.toLowerCase().includes('open')) || (title && title.toLowerCase().includes('announcement'))) {
      return 'text-purple-600 bg-purple-100';
    }
    
    const colors = {
      BOOKING: 'text-blue-600 bg-blue-100',
      SYSTEM: 'text-gray-600 bg-gray-100',
      REMINDER: 'text-orange-600 bg-orange-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const getCardStyle = (isRead) => {
    // Simplified styling - no special colors, just unread indicator
    return isRead 
      ? '' 
      : 'bg-blue-50';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  const isClickable = typeof onClick === "function";

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification._id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-start gap-3 ${isClickable ? "cursor-pointer hover:bg-gray-50" : "cursor-default"} transition-colors
        ${getCardStyle(notification.is_read)}
      `}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-lg ${getIconColor(notification.type, notification.title)} flex items-center justify-center`}
      >
        <span className="material-symbols-outlined text-xl">
          {getNotificationIcon(notification.type, notification.title)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

            {/* Action buttons for booking approval */}
            {notification.type === "BOOKING" &&
              notification.title.toLowerCase().includes("approval") && (
                <div className="flex items-center gap-2 mt-3">
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">
                    Approve
                  </button>
                  <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1.5 text-red-600 text-xs font-medium hover:underline">
                    Reject
                  </button>
                </div>
              )}

            {/* Action buttons for confirmed booking */}
            {notification.type === "BOOKING" &&
              notification.title.toLowerCase().includes("confirm") && (
                <div className="flex items-center gap-3 mt-3">
                  <button className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                    <span className="material-symbols-outlined text-sm">
                      event
                    </span>
                    Add to Calendar
                  </button>
                  <button className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                    <span className="material-symbols-outlined text-sm">
                      directions
                    </span>
                    Get Directions
                  </button>
                </div>
              )}
          </div>

          {/* Unread indicator and time */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatTimeAgo(notification.created_at)}
            </span>
            {!notification.is_read && (
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </div>
        </div>

        {showDelete && (
          <div className="mt-2">
            <button
              onClick={handleDelete}
              className="text-xs text-red-600 hover:text-red-700 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
