import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { COLORS } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  deleteNotification,
  fetchNotifications,
  markAllAsRead,
  markAsRead,
  NotificationItem,
} from '../services/notificationService';
import { RootStackParamList } from '../types/navigation';

type TypeFilter = 'all' | 'BOOKING' | 'SYSTEM' | 'REMINDER';

const formatTimeAgo = (value: string): string => {
  const date = new Date(value);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
};

const getIconConfig = (type: string, title: string) => {
  const normalized = title.toLowerCase();

  if (normalized.includes('reject')) {
    return { icon: 'close-circle-outline', bg: '#fee2e2', color: '#dc2626' };
  }

  if (normalized.includes('confirm') || normalized.includes('approve')) {
    return { icon: 'checkmark-circle-outline', bg: '#dcfce7', color: '#16a34a' };
  }

  if (type === 'SYSTEM') {
    return { icon: 'settings-outline', bg: '#e5e7eb', color: '#4b5563' };
  }

  if (type === 'REMINDER') {
    return { icon: 'alarm-outline', bg: '#ffedd5', color: '#ea580c' };
  }

  return { icon: 'notifications-outline', bg: '#dbeafe', color: '#2563eb' };
};

export default function NotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response = await fetchNotifications({
        page: 1,
        limit: 50,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        is_read: showUnreadOnly ? false : undefined,
      });

      if (!response.success) {
        setError(response.message || 'Failed to load notifications');
        setNotifications([]);
        return;
      }

      setNotifications(response.notifications || []);
    } catch (loadError: unknown) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load notifications';
      setError(message);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showUnreadOnly, typeFilter]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications]),
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return notifications;
    }

    return notifications.filter((item) => {
      const haystack = `${item.title} ${item.message}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [notifications, query]);

  const handlePressNotification = async (item: NotificationItem) => {
    if (item.is_read) {
      if (item.type === 'BOOKING' && item.target_id) {
        navigation.navigate('MyBookings');
      }
      return;
    }

    try {
      setProcessingId(item._id);
      const response = await markAsRead(item._id);

      if (!response.success) {
        Alert.alert('Failed', response.message || 'Could not mark as read');
        return;
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === item._id ? { ...notification, is_read: true } : notification,
        ),
      );

      if (item.type === 'BOOKING' && item.target_id) {
        navigation.navigate('MyBookings');
      }
    } catch (actionError: unknown) {
      const message = actionError instanceof Error ? actionError.message : 'Could not mark as read';
      Alert.alert('Failed', message);
    } finally {
      setProcessingId('');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await markAllAsRead();

      if (!response.success) {
        Alert.alert('Failed', response.message || 'Could not mark all as read');
        return;
      }

      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      Alert.alert('Success', response.message || 'All notifications marked as read');
    } catch (actionError: unknown) {
      const message = actionError instanceof Error ? actionError.message : 'Could not mark all as read';
      Alert.alert('Failed', message);
    }
  };

  const handleDelete = (item: NotificationItem) => {
    Alert.alert('Delete notification', 'Are you sure you want to delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setProcessingId(item._id);
            const response = await deleteNotification(item._id);
            if (!response.success) {
              Alert.alert('Failed', response.message || 'Could not delete notification');
              return;
            }

            setNotifications((prev) => prev.filter((notification) => notification._id !== item._id));
          } catch (actionError: unknown) {
            const message = actionError instanceof Error ? actionError.message : 'Could not delete notification';
            Alert.alert('Failed', message);
          } finally {
            setProcessingId('');
          }
        },
      },
    ]);
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => {
    const iconCfg = getIconConfig(item.type, item.title);
    const canDelete = item.recipient_type !== 'ALL_USERS';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePressNotification(item)}
      >
        <Card style={[styles.itemCard, !item.is_read && styles.unreadCard]}>
          <View style={styles.itemHeaderRow}>
            <View style={[styles.iconBox, { backgroundColor: iconCfg.bg }]}>
              <Ionicons name={iconCfg.icon as any} size={18} color={iconCfg.color} />
            </View>

            <View style={styles.itemContentWrap}>
              <View style={styles.itemTitleRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemTime}>{formatTimeAgo(item.created_at)}</Text>
              </View>

              <Text style={styles.itemMessage}>{item.message}</Text>

              <View style={styles.itemMetaRow}>
                {!item.is_read ? <View style={styles.unreadDot} /> : null}
                <Text style={styles.itemType}>{item.type}</Text>
                {processingId === item._id ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : null}
                {canDelete ? (
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadNotifications(true)}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={styles.pageTitle}>Notification Center</Text>
            <Text style={styles.pageSubtitle}>Stay updated with booking and system alerts.</Text>

            <Card style={styles.controlsCard}>
              <View style={styles.searchWrap}>
                <Ionicons name="search" size={16} color={COLORS.lightText} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search notifications"
                  placeholderTextColor={COLORS.lightText}
                  value={query}
                  onChangeText={setQuery}
                />
              </View>

              <View style={styles.filterRow}>
                {(['all', 'BOOKING', 'SYSTEM', 'REMINDER'] as const).map((filter) => {
                  const isActive = typeFilter === filter;
                  return (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => setTypeFilter(filter)}
                      style={[styles.filterChip, isActive && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                        {filter === 'all' ? 'All' : filter}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.unreadToggle, showUnreadOnly && styles.unreadToggleActive]}
                  onPress={() => setShowUnreadOnly((prev) => !prev)}
                >
                  <Text style={[styles.unreadToggleText, showUnreadOnly && styles.unreadToggleTextActive]}>
                    Unread only ({unreadCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {error ? (
              <Card style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
              </Card>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Ionicons name="notifications-off-outline" size={22} color={COLORS.lightText} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyDesc}>You are all caught up right now.</Text>
          </Card>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background2,
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.lightText,
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
    gap: 10,
  },
  headerWrap: {
    marginBottom: 8,
    gap: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
  },
  pageSubtitle: {
    color: COLORS.textGray,
    fontSize: 13,
    marginBottom: 2,
  },
  controlsCard: {
    gap: 10,
  },
  searchWrap: {
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 11,
  },
  searchInput: {
    flex: 1,
    color: COLORS.dark,
    fontSize: 13,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#eaf2ff',
  },
  filterChipText: {
    color: COLORS.textGray,
    fontSize: 11,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  unreadToggle: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  unreadToggleActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#eaf2ff',
  },
  unreadToggleText: {
    fontSize: 11,
    color: COLORS.textGray,
    fontWeight: '700',
  },
  unreadToggleTextActive: {
    color: COLORS.primary,
  },
  markAllText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  errorCard: {
    borderColor: COLORS.errorBorder,
    backgroundColor: COLORS.errorBg,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyTitle: {
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyDesc: {
    color: COLORS.lightText,
    fontSize: 12,
  },
  itemCard: {
    padding: 12,
  },
  unreadCard: {
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  itemContentWrap: {
    flex: 1,
    gap: 4,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    color: COLORS.dark,
    fontSize: 14,
    fontWeight: '700',
  },
  itemTime: {
    color: COLORS.lightText,
    fontSize: 11,
    fontWeight: '600',
  },
  itemMessage: {
    color: COLORS.textGray,
    fontSize: 12,
    lineHeight: 18,
  },
  itemMetaRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  itemType: {
    color: COLORS.lightText,
    fontSize: 11,
    fontWeight: '700',
    marginRight: 'auto',
  },
  deleteText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
  },
});
