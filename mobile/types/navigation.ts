import type { BookingItem } from '../services/bookingService';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Rooms: undefined;
  BookingRoom: { preselectedRoomId?: string } | undefined;
  Profile: undefined;
  Notifications: undefined;
  RoomDetail: { id: string };
  MyBookings: undefined;
  BookingDetail: { booking: BookingItem };
};
