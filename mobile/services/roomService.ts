import { api } from './authService';
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

export const getRooms = async (): Promise<RoomListResponse> => {
  try {
    const response = await api.get<RoomListResponse>("/rooms");
    return response.data;
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
    return response.data;
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
