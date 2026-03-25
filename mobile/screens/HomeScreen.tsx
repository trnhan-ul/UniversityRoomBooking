import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuthContext } from "../context/AuthContext";
import { COLORS } from "../constants/theme";
import { Card } from "../components";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuthContext();

  const handleOpenProfile = () => {
    navigation.navigate("Profile");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.headerLogo}>
            <Ionicons name="school" size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Student Home</Text>
            <Text style={styles.headerSubtitle}>Room Booking System</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleOpenProfile}
        >
          <Ionicons
            name="person-circle-outline"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
        <View style={styles.welcomeGrid}>
          <View style={styles.welcomeItem}>
            <Text style={styles.welcomeLabel}>Full Name</Text>
            <Text style={styles.welcomeValue}>
              {user?.full_name || "Student User"}
            </Text>
          </View>
          <View style={styles.welcomeItem}>
            <Text style={styles.welcomeLabel}>Email</Text>
            <Text style={styles.welcomeValue}>
              {user?.email || "student@fpt.edu.vn"}
            </Text>
          </View>
          <View style={styles.welcomeItem}>
            <Text style={styles.welcomeLabel}>Role</Text>
            <Text style={[styles.tagText, styles.roleTag]}>
              {user?.role || "STUDENT"}
            </Text>
          </View>
          <View style={styles.welcomeItem}>
            <Text style={styles.welcomeLabel}>Status</Text>
            <Text style={[styles.tagText, styles.statusTag]}>Active</Text>
          </View>
        </View>
      </Card>

      <TouchableOpacity
        style={styles.primaryActionButton}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("Rooms")}
      >
        <Ionicons name="flash-outline" size={18} color="#ffffff" />
        <Text style={styles.primaryActionText}>Quick Booking</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Main Features</Text>
      <View style={styles.featureGrid}>
        <TouchableOpacity
          style={styles.featurePressable}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Rooms")}
        >
          <Card style={styles.featureCard}>
            <View
              style={[styles.featureIconBox, { backgroundColor: "#e0edff" }]}
            >
              <Ionicons
                name="business-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.featureTitle}>Room</Text>
            <Text style={styles.featureDescription}>
              Find classrooms by location and capacity.
            </Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featurePressable}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("BookingRoom")}
        >
          <Card style={styles.featureCard}>
            <View
              style={[styles.featureIconBox, { backgroundColor: "#dcfce7" }]}
            >
              <Ionicons name="book-outline" size={20} color="#16a34a" />
            </View>
            <Text style={styles.featureTitle}>Book Room</Text>
            <Text style={styles.featureDescription}>
              Create a new booking request quickly.
            </Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featurePressable}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("MyBookings")}
        >
          <Card style={styles.featureCard}>
            <View
              style={[styles.featureIconBox, { backgroundColor: "#ede9fe" }]}
            >
              <Ionicons name="calendar-outline" size={20} color="#7c3aed" />
            </View>
            <Text style={styles.featureTitle}>My Bookings</Text>
            <Text style={styles.featureDescription}>
              Track and manage your upcoming bookings.
            </Text>
          </Card>
        </TouchableOpacity>

        <View style={styles.featurePressable}>
          <Card style={styles.featureCard}>
            <View
              style={[styles.featureIconBox, { backgroundColor: "#fee2e2" }]}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#dc2626"
              />
            </View>
            <Text style={styles.featureTitle}>Notifications</Text>
            <Text style={styles.featureDescription}>
              Stay updated with booking status changes.
            </Text>
          </Card>
        </View>
      </View>
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
    paddingBottom: 28,
  },
  header: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  profileButton: {
    padding: 4,
  },
  welcomeCard: {
    marginBottom: 12,
    padding: 14,
  },
  welcomeTitle: {
    color: COLORS.dark,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  welcomeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  welcomeItem: {
    width: '48%',
    marginBottom: 8,
  },
  welcomeLabel: {
    fontSize: 12,
    color: COLORS.lightText,
    marginBottom: 3,
  },
  welcomeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  tagText: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '600',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  roleTag: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  statusTag: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  primaryActionButton: {
    backgroundColor: COLORS.primary,
    height: 46,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 8,
  },
  primaryActionText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  featurePressable: {
    width: '48%',
    marginBottom: 10,
  },
  featureCard: {
    width: '100%',
    minHeight: 148,
    padding: 14,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDescription: {
    color: COLORS.textGray,
    fontSize: 12,
    lineHeight: 17,
  },
});
