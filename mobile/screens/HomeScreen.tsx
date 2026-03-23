import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import { Card, Section } from '../components';

export default function HomeScreen() {
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#136dec" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Card style={{ marginBottom: 24, alignItems: 'center', padding: 24 }}>
          <Ionicons name="person" size={48} color="#136dec" />
          <Text style={styles.cardTitle}>Welcome, {user?.full_name}!</Text>
          <Text style={styles.cardEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{user?.role}</Text>
          </View>
        </Card>

        <Section title="User Info">
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{user?.phone_number || 'Not provided'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoValue}>{user?.role}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{user?.status}</Text>
          </View>
        </Section>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
  },
  content: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 16,
  },
  cardEmail: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.lightText,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
});
