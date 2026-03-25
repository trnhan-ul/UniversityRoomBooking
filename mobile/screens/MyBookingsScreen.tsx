import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { COLORS } from '../constants/theme';
import { getMyBookings, BookingItem } from '../services/bookingService';
import { RootStackParamList } from '../types/navigation';

type MyBookingsNavProp = NativeStackNavigationProp<RootStackParamList, 'MyBookings'>;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  APPROVED: { bg: '#dcfce7', text: '#166534' },
  PENDING: { bg: '#fef9c3', text: '#854d0e' },
  REJECTED: { bg: '#fee2e2', text: '#991b1b' },
  CANCELLED: { bg: '#e5e7eb', text: '#374151' },
  'CHECKED-IN': { bg: '#dbeafe', text: '#1d4ed8' },
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function MyBookingsScreen() {
  const navigation = useNavigation<MyBookingsNavProp>();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchBookings = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const response = await getMyBookings();
      if (!response.success) {
        setError(response.message || 'Failed to load bookings');
        setBookings([]);
        return;
      }

      const items = response.data?.bookings || [];
      setBookings(items);
    } catch (fetchError: unknown) {
      const message =
        fetchError instanceof Error ? fetchError.message : 'Failed to load bookings';
      setError(message);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useMemo(
      () => () => {
        fetchBookings();
      },
      [],
    ),
  );

  const renderBooking = ({ item }: { item: BookingItem }) => {
    const colorSet = STATUS_COLORS[item.status] || {
      bg: '#e2e8f0',
      text: '#334155',
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('BookingDetail', { booking: item })}
      >
        <Card style={styles.bookingCard}>
          <View style={styles.rowBetween}>
            <View style={styles.roomBlock}>
              <Text style={styles.roomName}>{item.room_id?.room_name || 'Unknown room'}</Text>
              <Text style={styles.roomMeta}>
                {item.room_id?.room_code || 'N/A'} • {item.room_id?.location || 'N/A'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colorSet.bg }]}>
              <Text style={[styles.statusText, { color: colorSet.text }]}>{item.status}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={15} color={COLORS.lightText} />
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={15} color={COLORS.lightText} />
            <Text style={styles.detailText}>{item.start_time} - {item.end_time}</Text>
          </View>

          <Text style={styles.purposeText} numberOfLines={2}>
            {item.purpose || 'No purpose provided'}
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centeredText}>Loading your bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchBookings()}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={renderBooking}
        ListHeaderComponent={<Text style={styles.title}>My Bookings</Text>}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>Create your first booking to see it here.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBookings(true)}
            tintColor={COLORS.primary}
          />
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
  listContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
  },
  bookingCard: {
    padding: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  roomBlock: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
  },
  roomMeta: {
    fontSize: 12,
    color: COLORS.lightText,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  detailText: {
    color: COLORS.textGray,
    fontSize: 13,
    fontWeight: '500',
  },
  purposeText: {
    marginTop: 10,
    color: COLORS.textGray,
    fontSize: 12,
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background2,
    paddingHorizontal: 20,
  },
  centeredText: {
    marginTop: 8,
    color: COLORS.lightText,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  emptyWrap: {
    marginTop: 24,
    padding: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 6,
  },
  emptyText: {
    color: COLORS.lightText,
    lineHeight: 20,
  },
});
