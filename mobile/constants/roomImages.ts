import { ImageSourcePropType } from 'react-native';

const DEFAULT_ROOM_IMAGES: ImageSourcePropType[] = [
  require('../assets/images/rooms/default-room.png'),
];

const ROOM_IMAGES_BY_CODE: Record<string, ImageSourcePropType[]> = {
  A201: [
    require('../assets/images/rooms/phong1.jpg'),
    require('../assets/images/rooms/phong2.jpg'),
  ],
  B105: [
    require('../assets/images/rooms/phong4.jpg'),
    require('../assets/images/rooms/phong1.jpg'),
  ],
  A302: [
    require('../assets/images/rooms/phong4.jpg'),
  ],
  'C1-HALL': [
    require('../assets/images/rooms/hoitruong.jpeg'),
  ],
  D204: [
    require('../assets/images/rooms/lab.jpg'),
  ],
  E110: [
    require('../assets/images/rooms/phongnhac.jpeg'),
  ],
};

export const getRoomLocalImages = (roomCode?: string): ImageSourcePropType[] => {
  if (!roomCode) {
    return DEFAULT_ROOM_IMAGES;
  }

  return ROOM_IMAGES_BY_CODE[roomCode] || DEFAULT_ROOM_IMAGES;
};
