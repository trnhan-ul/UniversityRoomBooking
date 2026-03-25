import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../services/notificationService';
import NotificationItem from '../components/common/NotificationItem';
import Header from '../components/layout/Header';
import { useAuthContext } from '../context/AuthContext';
import { runMutationWithRefresh } from "../utils/mutationRefresh";

const NotificationPage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [activeType, setActiveType] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Fetch notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page,
        limit,
        type: activeType !== "all" ? activeType : undefined,
        is_read: showUnreadOnly ? false : undefined,
      };

      const response = await fetchNotifications(filters);

      if (response.success) {
        setNotifications(response.notifications || []);
        setTotalPages(response.pagination?.pages || 1);
      } else {
        setError(response.message || "Failed to load notifications");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, activeType, showUnreadOnly]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await markAsRead(notification._id);
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, is_read: true } : n,
          ),
        );
      }

      // Navigate to related page
      if (notification.type === "BOOKING" && notification.target_id) {
        navigate(`/bookings/${notification.target_id}`);
      }
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await runMutationWithRefresh({
        mutate: () => markAllAsRead(),
        refresh: loadNotifications,
      });
      if (response.success) {
        alert("All notifications marked as read");
      }
    } catch (error) {
      alert(error.message || "Failed to mark all as read");
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      const response = await runMutationWithRefresh({
        mutate: () => deleteNotification(notificationId),
        refresh: loadNotifications,
      });
      if (response.success) {
        alert("Notification deleted");
      }
    } catch (error) {
      alert(error.message || "Failed to delete notification");
    }
  };

  // Group notifications by date
  const groupByDate = (notifications) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    notifications.forEach((notification) => {
      const notifDate = new Date(notification.created_at);
      const notifDateOnly = new Date(
        notifDate.getFullYear(),
        notifDate.getMonth(),
        notifDate.getDate(),
      );

      if (notifDateOnly.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notifDateOnly.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notifDate >= lastWeek) {
        groups.lastWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  // Count notifications by type
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const approvalCount = notifications.filter(
    (n) => n.type === "BOOKING" && n.title.toLowerCase().includes("approval"),
  ).length;

  // Filter notifications by search query
  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Filter by time
  const getFilteredByTime = () => {
    const grouped = groupByDate(filteredNotifications);
    if (activeTimeFilter === "today") return grouped.today;
    if (activeTimeFilter === "yesterday") return grouped.yesterday;
    if (activeTimeFilter === "older")
      return [...grouped.lastWeek, ...grouped.older];
    return filteredNotifications;
  };

  const displayedNotifications = getFilteredByTime();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <aside className="w-56 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {/* Filters Section */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
                  Filters
                </h3>
                <p className="text-xs text-gray-500 mb-3">Recent by category</p>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveType("all");
                      setShowUnreadOnly(false);
                      setPage(1);
                    }}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        activeType === "all" && !showUnreadOnly
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-lg">
                      notifications
                    </span>
                    All Notifications
                  </button>

                  <button
                    onClick={() => {
                      setShowUnreadOnly(true);
                      setActiveType("all");
                      setPage(1);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        showUnreadOnly
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">
                        mail
                      </span>
                      Unread
                    </div>
                    {unreadCount > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${showUnreadOnly ? "bg-white text-blue-600" : "bg-gray-200 text-gray-700"}`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveType("BOOKING");
                      setShowUnreadOnly(false);
                      setPage(1);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        activeType === "BOOKING" && !showUnreadOnly
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">
                        approval
                      </span>
                      Approvals
                    </div>
                    {approvalCount > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${activeType === "BOOKING" && !showUnreadOnly ? "bg-white text-blue-600" : "bg-gray-200 text-gray-700"}`}
                      >
                        {approvalCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveType("SYSTEM");
                      setShowUnreadOnly(false);
                      setPage(1);
                    }}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        activeType === "SYSTEM" && !showUnreadOnly
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-lg">
                      settings
                    </span>
                    System
                  </button>
                </div>
              </div>

              {/* Shortcuts Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
                  Shortcuts
                </h3>
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      archive
                    </span>
                    Archived
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                    Trash
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Notification Center
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Stay updated with classroom requests and system alerts.
                  </p>
                </div>
                {hasUnread && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      done_all
                    </span>
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative mt-4">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Time Filter Tabs */}
              <div className="flex gap-1 mt-4 border-b border-gray-200">
                {[
                  { key: "today", label: "Today" },
                  { key: "yesterday", label: "Yesterday" },
                  { key: "older", label: "Older" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTimeFilter(tab.key)}
                    className={`
                      px-4 py-2 text-sm font-medium transition-colors relative
                      ${
                        activeTimeFilter === tab.key
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }
                    `}
                  >
                    {tab.label}
                    {activeTimeFilter === tab.key && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-600">{error}</div>
              ) : displayedNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-6xl text-gray-300">
                    notifications_off
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-4">
                    No notifications
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-200">
                    {displayedNotifications.map((notification) => (
                      <div key={notification._id} className="p-4">
                        <NotificationItem
                          notification={notification}
                          onClick={handleNotificationClick}
                          onDelete={handleDelete}
                          showDelete={false}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {page < totalPages && (
                    <div className="p-4 border-t border-gray-200 text-center">
                      <button
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Load More History
                        <span className="material-symbols-outlined text-lg">
                          expand_more
                        </span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
