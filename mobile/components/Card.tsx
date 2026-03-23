import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  gap?: number;
}

/**
 * Generic card component with consistent styling
 */
export const Card: React.FC<CardProps> = ({ children, style, padding = 16, gap = 12 }) => {
  return (
    <View style={[styles.card, { padding, gap }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default Card;
