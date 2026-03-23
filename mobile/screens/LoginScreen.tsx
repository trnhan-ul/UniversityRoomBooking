import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../context/AuthContext';
import { validateLoginForm, getErrorMessage } from '../utils/validation';
import { COLORS } from '../constants/theme';

export default function LoginScreen() {
  const { login, loading: authLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      setSuccessMessage('');
      setLoading(true);

      const validationError = validateLoginForm(email, password);
      if (validationError) {
        setError(validationError);
        return;
      }

      const success = await login(email, password);

      if (success) {
        setEmail('');
        setPassword('');
        setSuccessMessage('Login successful! Welcome!');
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.logoBox}>
            <Ionicons name="school" size={28} color="white" />
          </View>
          <Text style={styles.brandText}>FPT University</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>Welcome Back</Text>
            <Text style={styles.cardHeaderSubtitle}>
              Access your campus scheduling dashboard.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {successMessage ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail"
                  size={20}
                  color={COLORS.textGray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. name@fpt.edu.vn"
                  placeholderTextColor={COLORS.lightText}
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading && !authLoading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={COLORS.textGray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { paddingRight: 50 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.lightText}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading && !authLoading}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.textGray}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.signInButton,
                (loading || authLoading) && styles.signInButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading || authLoading}
            >
              {loading || authLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <Text style={styles.footerText}>Do not have an account? </Text>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Register now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.copyright}>
          Copyright 2024 FPT University Room Booking System. All rights reserved.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 52,
    height: 52,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  cardHeaderSubtitle: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark,
    padding: 0,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.errorText,
  },
  successContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  footer: {
    backgroundColor: COLORS.background2,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  copyright: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 24,
  },
});
