import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface SpecCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string | number;
  style?: ViewStyle;
}

/**
 * Spec card for displaying room info (capacity, status, etc.)
 */
export const SpecCard: React.FC<SpecCardProps> = ({ icon, label, value, style }) => {
  return (
    <View style={[styles.card, style]}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    gap: 4,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.lightText,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
  },
});

export default SpecCard;
