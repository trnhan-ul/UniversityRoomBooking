import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Section component with title and content
 */
export const Section: React.FC<SectionProps> = ({ title, children, style }) => {
  return (
    <View style={[styles.section, style]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
  },
});

export default Section;
