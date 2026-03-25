import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../context/AuthContext';
import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
  UserProfile,
} from '../services/profileService';
import { COLORS } from '../constants/theme';
import { getErrorMessage } from '../utils/validation';

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const roleLabel = useMemo(() => {
    switch (profile?.role || user?.role) {
      case 'ADMINISTRATOR':
        return 'Administrator';
      case 'FACILITY_MANAGER':
        return 'Facility Manager';
      case 'LECTURER':
        return 'Lecturer';
      default:
        return 'Student';
    }
  }, [profile?.role, user?.role]);

  const hydrateForm = useCallback((data: UserProfile) => {
    setProfile(data);
    setFullName(data.full_name || '');
    setPhoneNumber(data.phone_number || '');
    setAvatarUrl(data.avatar_url || '');
    setAvatarLoadError(false);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setError('');
      const result = await getMyProfile();
      if (result.success && result.data) {
        hydrateForm(result.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [hydrateForm]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      setError('');
      setSuccessMessage('');

      const trimmedName = fullName.trim();
      const trimmedPhone = phoneNumber.trim();

      if (!trimmedName) {
        setError('Full name cannot be empty');
        return;
      }

      if (trimmedPhone && !/^[0-9]{10,11}$/.test(trimmedPhone)) {
        setError('Phone number must be 10-11 digits');
        return;
      }

      setSaving(true);
      const result = await updateMyProfile({
        full_name: trimmedName,
        phone_number: trimmedPhone,
        avatar_url: avatarUrl.trim() || undefined,
      });

      if (result.success && result.data) {
        hydrateForm(result.data);
        setUser({
          _id: result.data.id,
          email: result.data.email,
          full_name: result.data.full_name,
          role: result.data.role,
          status: result.data.status,
          phone_number: result.data.phone_number,
          avatar: result.data.avatar_url || undefined,
          email_verified: Boolean(result.data.is_email_verified),
        });
        setSuccessMessage(result.message || 'Profile updated successfully');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setError('');
      setSuccessMessage('');

      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('Please fill in all password fields');
        return;
      }

      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('New password and confirm password do not match');
        return;
      }

      setSavingPassword(true);
      const result = await changeMyPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMessage(result.message || 'Password changed successfully');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (err) {
            setError(getErrorMessage(err));
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        {avatarUrl && !avatarLoadError ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatarCircle}
            onError={() => setAvatarLoadError(true)}
          />
        ) : (
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={28} color="#ffffff" />
          </View>
        )}
        <Text style={styles.name}>{profile?.full_name || user?.full_name || 'User'}</Text>
        <Text style={styles.email}>{profile?.email || user?.email || ''}</Text>
        <Text style={styles.roleTag}>{roleLabel}</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {successMessage ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter full name"
          placeholderTextColor={COLORS.lightText}
          editable={!saving}
        />

        <Text style={styles.label}>Email (read-only)</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          value={profile?.email || user?.email || ''}
          editable={false}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          placeholderTextColor={COLORS.lightText}
          keyboardType="phone-pad"
          editable={!saving}
        />

        <Text style={styles.label}>Avatar URL</Text>
        <TextInput
          style={styles.input}
          value={avatarUrl}
          onChangeText={(text) => {
            setAvatarUrl(text);
            setAvatarLoadError(false);
          }}
          placeholder="https://example.com/avatar.jpg"
          placeholderTextColor={COLORS.lightText}
          autoCapitalize="none"
          editable={!saving}
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.formCard, styles.passwordCard]}>
        <Text style={styles.sectionTitle}>Change Password</Text>

        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          placeholderTextColor={COLORS.lightText}
          secureTextEntry
          editable={!savingPassword}
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          placeholderTextColor={COLORS.lightText}
          secureTextEntry
          editable={!savingPassword}
        />

        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor={COLORS.lightText}
          secureTextEntry
          editable={!savingPassword}
        />

        <TouchableOpacity
          style={[styles.saveButton, savingPassword && styles.buttonDisabled]}
          onPress={handleChangePassword}
          disabled={savingPassword}
        >
          {savingPassword ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ffffff" />
        <Text style={styles.logoutText}>Logout</Text>
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
    paddingBottom: 28,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background2,
  },
  headerCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
  },
  email: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 3,
  },
  roleTag: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  formCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  passwordCard: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    color: COLORS.dark,
    backgroundColor: COLORS.background,
  },
  readOnlyInput: {
    backgroundColor: '#f8fafc',
    color: '#64748b',
  },
  saveButton: {
    marginTop: 16,
    height: 46,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  logoutButton: {
    marginTop: 12,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: COLORS.successBg,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  successText: {
    color: COLORS.successText,
    fontSize: 14,
  },
});
