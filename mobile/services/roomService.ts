import { api } from './authService';
import { API_CONFIG } from '../config/api';
import { CustomApiError } from '../utils/errorHandler';
import { getErrorMessage } from '../utils/validation';

export interface RoomSummary {
  _id: string;
  room_code: string;
  room_name: string;
  capacity: number;
  location: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';
  description?: string;
  equipment?: string[];
  images?: string[];
}

export interface EquipmentItem {
  _id: string;
  name: string;
  quantity?: number;
  status?: string;
}

interface RoomListResponse {
  success: boolean;
  data: RoomSummary[];
  message?: string;
}

interface RoomDetailResponse {
  success: boolean;
  data: RoomSummary;
  message?: string;
}

interface EquipmentResponse {
  success: boolean;
  data: EquipmentItem[];
  message?: string;
}

const getApiOrigin = () => API_CONFIG.BASE_URL.replace(/\/api\/?$/, '');

const normalizeImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return imageUrl;
  if (imageUrl.startsWith('data:image')) return imageUrl;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;

  const apiOrigin = getApiOrigin();
  if (imageUrl.startsWith('/')) {
    return `${apiOrigin}${imageUrl}`;
  }

  return `${apiOrigin}/${imageUrl}`;
};

const normalizeRoomImages = (room: RoomSummary): RoomSummary => ({
  ...room,
  images: Array.isArray(room.images)
    ? room.images.filter(Boolean).map(normalizeImageUrl)
    : [],
});

export const getRooms = async (): Promise<RoomListResponse> => {
  try {
    const response = await api.get<RoomListResponse>("/rooms");
    return {
      ...response.data,
      data: Array.isArray(response.data.data)
        ? response.data.data.map(normalizeRoomImages)
        : [],
    };
  } catch (error) {
    const errorData = (error as { response?: { data?: RoomListResponse } })
      ?.response?.data;
    const message = errorData
      ? getErrorMessage(errorData)
      : getErrorMessage(error);
    throw new CustomApiError(message, errorData);
  }
};

export const getRoomById = async (id: string): Promise<RoomDetailResponse> => {
  try {
    const response = await api.get<RoomDetailResponse>(`/rooms/${id}`);
    return {
      ...response.data,
      data: normalizeRoomImages(response.data.data),
    };
  } catch (error) {
    const errorData = (error as { response?: { data?: RoomDetailResponse } })
      ?.response?.data;
    const message = errorData
      ? getErrorMessage(errorData)
      : getErrorMessage(error);
    throw new CustomApiError(message, errorData);
  }
};

export const getEquipmentByRoom = async (
  roomId: string,
): Promise<EquipmentResponse> => {
  try {
    const response = await api.get<EquipmentResponse>(
      `/equipment/room/${roomId}`,
    );
    return response.data;
  } catch (error) {
    const errorData = (error as { response?: { data?: EquipmentResponse } })
      ?.response?.data;
    const message = errorData
      ? getErrorMessage(errorData)
      : getErrorMessage(error);
    throw new CustomApiError(message, errorData);
  }
};
