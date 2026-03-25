import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { COLORS } from '../constants/theme';
import { BookingItem, cancelBooking, getBookingById } from '../services/bookingService';
import { RootStackParamList } from '../types/navigation';
import { formatTime12Hour } from "../utils/roomHelpers";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  APPROVED: { bg: "#dcfce7", text: "#166534" },
  PENDING: { bg: "#fef9c3", text: "#854d0e" },
  REJECTED: { bg: "#fee2e2", text: "#991b1b" },
  CANCELLED: { bg: "#e5e7eb", text: "#374151" },
  "CHECKED-IN": { bg: "#dbeafe", text: "#1d4ed8" },
};

const formatDateTime = (value: string) => {
  if (!value) {
    return "N/A";
  }

  // Parse date-only values as local dates to avoid timezone day shifts.
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
      )
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function BookingDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "BookingDetail">>();
  const bookingId = route.params?.booking?._id;
  const [booking, setBooking] = useState<BookingItem | null>(
    route.params?.booking ?? null,
  );
  const [loadingDetail, setLoadingDetail] = useState(!route.params?.booking);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBookingDetail = useCallback(async () => {
    if (!bookingId) {
      setLoadError("Booking ID is missing.");
      return;
    }

    try {
      setLoadingDetail(true);
      setLoadError("");
      const response = await getBookingById(bookingId);

      if (!response.success || !response.data) {
        setLoadError(response.message || "Failed to load booking details.");
        return;
      }

      setBooking(response.data);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load booking details.";
      setLoadError(message);
    } finally {
      setLoadingDetail(false);
    }
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      fetchBookingDetail();
    }, [fetchBookingDetail]),
  );

  if (loadingDetail && !booking) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centeredText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {loadError || "Booking details are not available."}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchBookingDetail}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canCancel =
    booking.status === "PENDING" || booking.status === "APPROVED";

  const colorSet = STATUS_COLORS[booking.status] || {
    bg: "#e2e8f0",
    text: "#334155",
  };

  const handleCancelBooking = () => {
    Alert.alert(
      "Cancel booking",
      "Do you want to cancel this booking request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: async () => {
            try {
              setSubmitting(true);
              const response = await cancelBooking(booking._id);
              if (!response.success) {
                Alert.alert(
                  "Cancel failed",
                  response.message || "Failed to cancel booking",
                );
                return;
              }

              const updatedBooking = response.data;
              if (updatedBooking) {
                setBooking(updatedBooking);
              }

              Alert.alert(
                "Success",
                response.message || "Booking has been cancelled",
              );
            } catch (error: unknown) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Failed to cancel booking";
              Alert.alert("Cancel failed", message);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Booking Detail</Text>

      {loadError ? <Text style={styles.warningText}>{loadError}</Text> : null}

      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.roomName}>
              {booking.room_id?.room_name || "Unknown room"}
            </Text>
            <Text style={styles.roomMeta}>
              {booking.room_id?.room_code || "N/A"} •{" "}
              {booking.room_id?.location || "N/A"}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colorSet.bg }]}>
            <Text style={[styles.statusText, { color: colorSet.text }]}>
              {booking.status}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Schedule</Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={COLORS.lightText}
          />
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>{formatDateTime(booking.date)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.lightText} />
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>
            {formatTime12Hour(booking.start_time)} -{" "}
            {formatTime12Hour(booking.end_time)}
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Booking Information</Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="document-text-outline"
            size={16}
            color={COLORS.lightText}
          />
          <Text style={styles.infoLabel}>Purpose</Text>
        </View>
        <Text style={styles.purposeText}>
          {booking.purpose || "No purpose provided"}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="finger-print-outline"
            size={16}
            color={COLORS.lightText}
          />
          <Text style={styles.infoLabel}>Booking ID</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {booking._id}
          </Text>
        </View>

        {canCancel ? (
          <TouchableOpacity
            style={[
              styles.cancelButton,
              submitting && styles.cancelButtonDisabled,
            ]}
            onPress={handleCancelBooking}
            disabled={submitting}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Cancel booking"
            accessibilityHint="Cancels this booking request"
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            )}
          </TouchableOpacity>
        ) : null}
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
  warningText: {
    color: COLORS.errorText,
    fontSize: 13,
    lineHeight: 18,
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
  cancelButton: {
    marginTop: 6,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
  },
  cancelButtonDisabled: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background2,
    paddingHorizontal: 20,
    gap: 10,
  },
  centeredText: {
    color: COLORS.lightText,
    marginTop: 8,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 6,
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
});
