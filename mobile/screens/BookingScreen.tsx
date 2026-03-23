import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { Card } from '../components';
import { RootStackParamList } from '../types/navigation';

export default function BookingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Booking'>>();
  const { roomId, roomName, date, start, end } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Screen</Text>
      <Text style={styles.subtitle}>Ready to integrate booking form/API flow.</Text>

      <Card padding={16} gap={6}>
        <Text style={styles.label}>Room:</Text>
        <Text style={styles.value}>{roomName || roomId || 'N/A'}</Text>

        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{date || 'N/A'}</Text>

        <Text style={styles.label}>Time:</Text>
        <Text style={styles.value}>{start && end ? `${start} - ${end}` : 'Select a slot from Room Details'}</Text>
      </Card>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back to Room Detail</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background2,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: COLORS.textGray,
    fontWeight: '600',
  },
  value: {
    fontSize: 15,
    color: COLORS.dark,
    fontWeight: '600',
    marginBottom: 4,
  },
  button: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '700',
  },
});
