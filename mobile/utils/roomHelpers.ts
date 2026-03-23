/**
 * Room-related utility functions
 */

import { EquipmentItem, RoomSummary } from '../services/roomService';

export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
}

const SLOT_START_HOUR = 7;
const SLOT_END_HOUR = 21;

/**
 * Convert hour to HH:mm format
 */
export const toHHmm = (hour: number): string => `${String(hour).padStart(2, '0')}:00`;

/**
 * Generate available time slots for a given date and room status
 */
export const buildTimeSlots = (selectedDate: string, roomStatus?: string): TimeSlot[] => {
  if (roomStatus && roomStatus !== 'AVAILABLE') {
    return [];
  }

  const slots: TimeSlot[] = [];
  const today = new Date();
  const isToday = selectedDate === today.toISOString().split('T')[0];

  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour += 1) {
    if (isToday && hour <= today.getHours()) {
      continue;
    }

    const start = toHHmm(hour);
    const end = toHHmm(hour + 1);

    slots.push({
      id: `${selectedDate}-${start}`,
      label: `${start} - ${end}`,
      start,
      end,
    });
  }

  return slots;
};

/**
 * Normalize equipment from either explicit list or room data
 */
export const normalizeEquipment = (room: RoomSummary | null, equipmentList: EquipmentItem[]): string[] => {
  if (equipmentList.length > 0) {
    return equipmentList.map((item) => item.name);
  }

  return room?.equipment || [];
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};
