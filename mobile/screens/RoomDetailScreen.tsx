import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getEquipmentByRoom, getRoomById, RoomSummary, EquipmentItem } from '../services/roomService';
import { COLORS } from '../constants/theme';
import { buildTimeSlots, normalizeEquipment, getTodayDate, TimeSlot } from '../utils/roomHelpers';
import { SpecCard, Section, EquipmentChips, TimeSlotGrid, ImageGallery } from '../components';
import { RootStackParamList } from '../types/navigation';

export default function RoomDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RoomDetail'>>();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<RoomSummary | null>(null);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [selectedDate] = useState(getTodayDate());
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError('');

        const [roomRes, equipmentRes] = await Promise.all([
          getRoomById(id),
          getEquipmentByRoom(id),
        ]);

        if (roomRes.success) {
          setRoom(roomRes.data);
        }

        if (equipmentRes.success) {
          setEquipment(equipmentRes.data || []);
        }
      } catch (fetchError: any) {
        setError(fetchError?.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const imageList = room?.images && room.images.length > 0 ? room.images : [];
  const displayEquipment = normalizeEquipment(room, equipment);

  const availableSlots = useMemo(() => buildTimeSlots(selectedDate, room?.status), [selectedDate, room?.status]);

  const handleBackHome = () => {
    navigation.navigate('Home');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !room) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Room not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.roomName}>{room.room_name}</Text>
      <Text style={styles.roomMeta}>{room.room_code} • {room.location}</Text>

      <View style={styles.specGrid}>
        <SpecCard icon="people" label="Capacity" value={room.capacity} />
        <SpecCard icon="checkmark-circle" label="Status" value={room.status} />
      </View>

      <Section title="Description">
        <Text style={styles.descriptionText}>{room.description?.trim() || 'No description provided.'}</Text>
      </Section>

      <Section title="Images">
        <ImageGallery images={imageList} />
      </Section>

      <Section title="Equipment">
        <EquipmentChips items={displayEquipment} />
      </Section>

      <Section title="Available Time Slots">
        <TimeSlotGrid slots={availableSlots} onSlotPress={() => {}} />
      </Section>

      <TouchableOpacity style={styles.bookButton} onPress={handleBackHome}>
        <Text style={styles.bookButtonText}>Back to Home</Text>
      </TouchableOpacity>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background2,
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.errorText,
    fontWeight: '600',
    textAlign: 'center',
  },
  roomName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
  },
  roomMeta: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  specGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textGray,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    marginVertical: 8,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
