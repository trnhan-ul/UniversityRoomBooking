import type { BookingItem } from '../services/bookingService';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  RoomDetail: { id: string };
  MyBookings: undefined;
  BookingDetail: { booking: BookingItem };
};
