import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { COLORS } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  APPROVED: { bg: '#dcfce7', text: '#166534' },
  PENDING: { bg: '#fef9c3', text: '#854d0e' },
  REJECTED: { bg: '#fee2e2', text: '#991b1b' },
  CANCELLED: { bg: '#e5e7eb', text: '#374151' },
  'CHECKED-IN': { bg: '#dbeafe', text: '#1d4ed8' },
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function BookingDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'BookingDetail'>>();
  const { booking } = route.params;

  const colorSet = STATUS_COLORS[booking.status] || {
    bg: '#e2e8f0',
    text: '#334155',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Booking Detail</Text>

      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.roomName}>{booking.room_id?.room_name || 'Unknown room'}</Text>
            <Text style={styles.roomMeta}>
              {booking.room_id?.room_code || 'N/A'} • {booking.room_id?.location || 'N/A'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colorSet.bg }]}>
            <Text style={[styles.statusText, { color: colorSet.text }]}>{booking.status}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Schedule</Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.lightText} />
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>{formatDateTime(booking.date)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.lightText} />
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>{booking.start_time} - {booking.end_time}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Booking Information</Text>

        <View style={styles.infoRow}>
          <Ionicons name="document-text-outline" size={16} color={COLORS.lightText} />
          <Text style={styles.infoLabel}>Purpose</Text>
        </View>
        <Text style={styles.purposeText}>{booking.purpose || 'No purpose provided'}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="finger-print-outline" size={16} color={COLORS.lightText} />
          <Text style={styles.infoLabel}>Booking ID</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {booking._id}
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background2,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
  },
  card: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  roomName: {
    fontSize: 18,
    color: COLORS.dark,
    fontWeight: '700',
  },
  roomMeta: {
    marginTop: 4,
    color: COLORS.lightText,
    fontSize: 13,
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    color: COLORS.textGray,
    fontSize: 13,
    fontWeight: '600',
    minWidth: 68,
  },
  infoValue: {
    color: COLORS.dark,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  purposeText: {
    color: COLORS.dark,
    lineHeight: 20,
    marginBottom: 10,
  },
});
