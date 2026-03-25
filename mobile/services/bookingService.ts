import { AxiosError } from 'axios';
import { API_CONFIG } from '../config/api';
import { CustomApiError } from '../utils/errorHandler';
import { getErrorMessage } from '../utils/validation';
import { api } from './authService';

export interface BookingRoom {
  _id: string;
  room_name: string;
  room_code: string;
  location: string;
  capacity?: number;
}

export interface BookingItem {
  _id: string;
  room_id: BookingRoom;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CHECKED-IN';
  created_at?: string;
  updated_at?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
}

interface MyBookingsPayload {
  bookings: BookingItem[];
  pagination?: Pagination;
}

export interface MyBookingsResponse {
  success: boolean;
  data?: MyBookingsPayload;
  message?: string;
}

interface BookingDetailResponse {
  success: boolean;
  data?: BookingItem;
  message?: string;
}

export const getMyBookings = async (): Promise<MyBookingsResponse> => {
  try {
    const response = await api.get<MyBookingsResponse>(
      API_CONFIG.ENDPOINTS.BOOKING.MY_BOOKINGS,
    );

    const payload = response.data;
    const bookings = payload.data?.bookings || [];

    return {
      ...payload,
      data: {
        bookings,
        pagination: payload.data?.pagination,
      },
    };
  } catch (error) {
    const axiosError = error as AxiosError<MyBookingsResponse>;
    const errorData = axiosError.response?.data;
    const errorMessage = errorData
      ? getErrorMessage(errorData)
      : getErrorMessage(error);

    throw new CustomApiError(errorMessage, errorData);
  }
};

export const getBookingById = async (
  bookingId: string,
): Promise<BookingDetailResponse> => {
  try {
    const response = await api.get<BookingDetailResponse>(
      `${API_CONFIG.ENDPOINTS.BOOKING.DETAIL}/${bookingId}`,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<BookingDetailResponse>;
    const errorData = axiosError.response?.data;
    const errorMessage = errorData
      ? getErrorMessage(errorData)
      : getErrorMessage(error);

    throw new CustomApiError(errorMessage, errorData);
  }
};
