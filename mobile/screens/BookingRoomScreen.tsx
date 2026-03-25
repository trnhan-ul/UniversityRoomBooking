import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { COLORS } from '../constants/theme';
import { getRooms, RoomSummary } from '../services/roomService';
import { createBooking } from '../services/bookingService';
import { RootStackParamList } from '../types/navigation';
import { getTodayDate } from '../utils/roomHelpers';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'BookingRoom'>;
type RouteProps = RouteProp<RootStackParamList, 'BookingRoom'>;

const TIME_OPTIONS = Array.from({ length: 15 }, (_, index) => {
  const hour = index + 7;
  return `${String(hour).padStart(2, '0')}:00`;
});

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateInput = (value: string): boolean => {
  if (!DATE_REGEX.test(value)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (
    Number.isNaN(year)
    || Number.isNaN(month)
    || Number.isNaN(day)
    || month < 1
    || month > 12
    || day < 1
    || day > 31
  ) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
  );
};

const isPastDate = (value: string): boolean => {
  const selected = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today;
};

const buildRoomLabel = (room: RoomSummary): string => {
  return `${room.room_code} • ${room.room_name}`;
};

export default function BookingRoomScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [roomId, setRoomId] = useState(route.params?.preselectedRoomId || '');
  const [date, setDate] = useState(getTodayDate());
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        setError('');
        const response = await getRooms();

        if (!response.success) {
          setError(response.message || 'Failed to load available rooms');
          return;
        }

        const availableRooms = (response.data || []).filter(
          (room) => room.status === 'AVAILABLE',
        );
        setRooms(availableRooms);

        setRoomId((currentRoomId) => currentRoomId || availableRooms[0]?._id || '');
      } catch (fetchError: unknown) {
        const message =
          fetchError instanceof Error ? fetchError.message : 'Failed to load available rooms';
        setError(message);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room._id === roomId) || null,
    [rooms, roomId],
  );

  const endTimeOptions = useMemo(
    () => TIME_OPTIONS.filter((item) => item > startTime),
    [startTime],
  );

  useEffect(() => {
    if (!endTimeOptions.includes(endTime) && endTimeOptions.length > 0) {
      setEndTime(endTimeOptions[0]);
    }
  }, [endTime, endTimeOptions]);

  const validateForm = (): string | null => {
    if (!roomId) {
      return 'Please choose a room';
    }

    if (!isValidDateInput(date)) {
      return 'Date must be in YYYY-MM-DD format';
    }

    if (isPastDate(date)) {
      return 'Date cannot be in the past';
    }

    if (!startTime || !endTime) {
      return 'Please choose both start time and end time';
    }

    if (endTime <= startTime) {
      return 'End time must be after start time';
    }

    if (!purpose.trim()) {
      return 'Please enter booking purpose';
    }

    if (purpose.trim().length < 6) {
      return 'Purpose should be at least 6 characters';
    }

    return null;
  };

  const handleCreateBooking = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSuccessMessage('');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');

      const response = await createBooking({
        room_id: roomId,
        date,
        start_time: startTime,
        end_time: endTime,
        purpose: purpose.trim(),
      });

      if (!response.success) {
        setError(response.message || 'Failed to create booking');
        return;
      }

      setSuccessMessage(response.message || 'Booking created successfully. Waiting for approval.');
      setPurpose('');
    } catch (submitError: unknown) {
      const message =
        submitError instanceof Error ? submitError.message : 'Failed to create booking';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.headerRow}>
            <Ionicons name="book-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Create Booking</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Fill your booking details below. This follows the same flow as the web booking form.
          </Text>
        </Card>

        {error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        ) : null}

        {successMessage ? (
          <Card style={styles.successCard}>
            <Text style={styles.successText}>{successMessage}</Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => navigation.navigate('MyBookings')}
              activeOpacity={0.9}
            >
              <Text style={styles.successButtonText}>Go to My Bookings</Text>
            </TouchableOpacity>
          </Card>
        ) : null}

        <Card>
          <Text style={styles.label}>1. Select Room</Text>
          {loadingRooms ? (
            <Text style={styles.helperText}>Loading available rooms...</Text>
          ) : rooms.length === 0 ? (
            <Text style={styles.helperText}>No available rooms found.</Text>
          ) : (
            <View style={styles.roomList}>
              {rooms.map((room) => {
                const isActive = room._id === roomId;
                return (
                  <TouchableOpacity
                    key={room._id}
                    style={[styles.roomItem, isActive && styles.roomItemActive]}
                    onPress={() => setRoomId(room._id)}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.roomTitle, isActive && styles.roomTitleActive]}>
                      {buildRoomLabel(room)}
                    </Text>
                    <Text style={[styles.roomSub, isActive && styles.roomSubActive]}>
                      {room.location} • Capacity {room.capacity}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.label}>2. Date & Time</Text>

          <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.lightText}
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>Start Time</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeRow}
          >
            {TIME_OPTIONS.map((time) => {
              const isActive = startTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeChip, isActive && styles.timeChipActive]}
                  onPress={() => setStartTime(time)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.timeChipText, isActive && styles.timeChipTextActive]}>{time}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.fieldLabel}>End Time</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeRow}
          >
            {endTimeOptions.map((time) => {
              const isActive = endTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeChip, isActive && styles.timeChipActive]}
                  onPress={() => setEndTime(time)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.timeChipText, isActive && styles.timeChipTextActive]}>{time}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Card>

        <Card>
          <Text style={styles.label}>3. Purpose</Text>
          <TextInput
            value={purpose}
            onChangeText={setPurpose}
            style={[styles.input, styles.textArea]}
            placeholder="Example: Study group meeting for software engineering"
            placeholderTextColor={COLORS.lightText}
            multiline
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={styles.counterText}>{purpose.trim().length}/300</Text>
        </Card>

        <Card>
          <Text style={styles.label}>Review</Text>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Room</Text>
            <Text style={styles.reviewValue}>{selectedRoom ? buildRoomLabel(selectedRoom) : 'N/A'}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Date</Text>
            <Text style={styles.reviewValue}>{date}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Time</Text>
            <Text style={styles.reviewValue}>{startTime} - {endTime}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Purpose</Text>
            <Text style={styles.reviewValue}>{purpose.trim() || 'N/A'}</Text>
          </View>
        </Card>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleCreateBooking}
          activeOpacity={0.9}
          disabled={submitting}
        >
          <Text style={styles.submitText}>{submitting ? 'Creating Booking...' : 'Create Booking'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background2,
  },
  content: {
    padding: 16,
    gap: 10,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: COLORS.dark,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionDesc: {
    color: COLORS.textGray,
    fontSize: 13,
    lineHeight: 19,
  },
  errorCard: {
    backgroundColor: COLORS.errorBg,
    borderColor: COLORS.errorBorder,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 13,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.successBorder,
    gap: 10,
  },
  successText: {
    color: COLORS.successText,
    fontSize: 13,
    fontWeight: '600',
  },
  successButton: {
    backgroundColor: COLORS.primary,
    height: 40,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  helperText: {
    color: COLORS.lightText,
    fontSize: 13,
  },
  roomList: {
    gap: 8,
  },
  roomItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: COLORS.background,
  },
  roomItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#eaf2ff',
  },
  roomTitle: {
    color: COLORS.dark,
    fontWeight: '700',
    fontSize: 13,
  },
  roomTitleActive: {
    color: COLORS.primary,
  },
  roomSub: {
    color: COLORS.textGray,
    fontSize: 12,
    marginTop: 2,
  },
  roomSubActive: {
    color: '#2f4b75',
  },
  fieldLabel: {
    color: COLORS.dark,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    height: 44,
    paddingHorizontal: 12,
    color: COLORS.dark,
    fontSize: 14,
  },
  textArea: {
    minHeight: 98,
    height: 98,
    paddingTop: 10,
  },
  counterText: {
    alignSelf: 'flex-end',
    color: COLORS.lightText,
    fontSize: 11,
  },
  timeRow: {
    gap: 8,
    paddingBottom: 2,
  },
  timeChip: {
    minWidth: 68,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
  },
  timeChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#eaf2ff',
  },
  timeChipText: {
    color: COLORS.textGray,
    fontSize: 12,
    fontWeight: '600',
  },
  timeChipTextActive: {
    color: COLORS.primary,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 2,
  },
  reviewLabel: {
    color: COLORS.lightText,
    fontSize: 12,
    fontWeight: '600',
  },
  reviewValue: {
    color: COLORS.dark,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  submitButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
