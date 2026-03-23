import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

interface EquipmentChipsProps {
  items: string[];
}

/**
 * Display equipment as chips
 */
export const EquipmentChips: React.FC<EquipmentChipsProps> = ({ items }) => {
  if (items.length === 0) {
    return <Text style={styles.placeholder}>No equipment listed for this room.</Text>;
  }

  return (
    <View style={styles.chipWrap}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.chip}>
          <Text style={styles.chipText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.primary,
    opacity: 0.1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 13,
    color: COLORS.textGray,
  },
});

export default EquipmentChips;
