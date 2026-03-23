export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  RoomDetail: { id: string };
  Booking: {
    roomId?: string;
    roomName?: string;
    date?: string;
    start?: string;
    end?: string;
  };
};
