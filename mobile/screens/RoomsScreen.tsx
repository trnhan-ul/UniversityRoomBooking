import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { COLORS } from '../constants/theme';
import { getRooms, RoomSummary } from '../services/roomService';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RoomsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const fetchRooms = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');
      const response = await getRooms();
      if (response.success) {
        setRooms(response.data || []);
      }
    } catch (fetchError: any) {
      setError(fetchError?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [fetchRooms]),
  );

  const filteredRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rooms
      .filter((room) => room.status === 'AVAILABLE')
      .filter((room) => {
        if (!normalizedQuery) return true;

        const haystack = `${room.room_code} ${room.room_name} ${room.location}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });
  }, [rooms, query]);

  const handleRoomPress = (roomId: string) => {
    navigation.navigate('RoomDetail', { id: roomId });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchRooms(true)}
          tintColor={COLORS.primary}
        />
      }
    >
      <Card style={styles.searchCard}>
        <Text style={styles.searchLabel}>Search Available Rooms</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={18} color={COLORS.lightText} />
          <TextInput
            style={styles.input}
            placeholder="Search by code, name, or location"
            placeholderTextColor={COLORS.lightText}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </Card>

      {error ? (
        <Card style={styles.stateCard}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchRooms()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </Card>
      ) : null}

      {!error && filteredRooms.length === 0 ? (
        <Card style={styles.stateCard}>
          <Text style={styles.emptyTitle}>No available rooms found</Text>
          <Text style={styles.emptyDescription}>Try a different keyword or pull down to refresh.</Text>
        </Card>
      ) : null}

      {!error
        ? filteredRooms.map((room) => (
            <TouchableOpacity
              key={room._id}
              activeOpacity={0.9}
              onPress={() => handleRoomPress(room._id)}
              style={styles.roomPressable}
            >
              <Card style={styles.roomCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.roomCode}>{room.room_code}</Text>
                  <Text style={styles.statusTag}>Available</Text>
                </View>

                <Text style={styles.roomName}>{room.room_name}</Text>
                <Text style={styles.roomLocation}>{room.location}</Text>

                <View style={styles.metaRow}>
                  <Ionicons name="people-outline" size={15} color={COLORS.textGray} />
                  <Text style={styles.metaText}>Capacity: {room.capacity}</Text>
                </View>

                <View style={styles.enterRow}>
                  <Text style={styles.enterText}>View details</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                </View>
              </Card>
            </TouchableOpacity>
          ))
        : null}
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
    paddingBottom: 24,
    gap: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background2,
  },
  searchCard: {
    gap: 10,
  },
  searchLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
  },
  inputWrap: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    color: COLORS.dark,
    fontSize: 14,
    padding: 0,
  },
  stateCard: {
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyTitle: {
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyDescription: {
    color: COLORS.lightText,
    textAlign: 'center',
    fontSize: 13,
  },
  roomPressable: {
    marginTop: 2,
  },
  roomCard: {
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomCode: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  roomName: {
    color: COLORS.dark,
    fontSize: 17,
    fontWeight: '700',
  },
  roomLocation: {
    color: COLORS.textGray,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: COLORS.textGray,
    fontSize: 13,
    fontWeight: '500',
  },
  enterRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  enterText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});