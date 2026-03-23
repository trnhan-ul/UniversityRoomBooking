import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { TimeSlot } from '../utils/roomHelpers';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  onSlotPress: (slot: TimeSlot) => void;
}

/**
 * Display available time slots as a grid of buttons
 */
export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ slots, onSlotPress }) => {
  if (slots.length === 0) {
    return <Text style={styles.placeholder}>No available slots for selected date.</Text>;
  }

  return (
    <View style={styles.slotWrap}>
      {slots.map((slot) => (
        <TouchableOpacity
          key={slot.id}
          style={styles.slotButton}
          onPress={() => onSlotPress(slot)}
          activeOpacity={0.7}
        >
          <Text style={styles.slotText}>{slot.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  slotWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotButton: {
    backgroundColor: COLORS.successBg,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  slotText: {
    fontSize: 12,
    color: COLORS.successText,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 13,
    color: COLORS.textGray,
  },
});

export default TimeSlotGrid;
