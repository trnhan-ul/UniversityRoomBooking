import { AxiosError } from 'axios';
import { API_CONFIG } from '../config/api';
import { CustomApiError } from '../utils/errorHandler';
import { getErrorMessage } from '../utils/validation';
import { api } from './authService';

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'SYSTEM' | 'REMINDER' | 'FACILITY_ISSUE' | 'FACILITY_ISSUE_UPDATE';
  is_read: boolean;
  recipient_type?: 'INDIVIDUAL' | 'ALL_USERS';
  target_type?: string | null;
  target_id?: string | null;
  created_at: string;
}

interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface NotificationListResponse {
  success: boolean;
  notifications?: NotificationItem[];
  pagination?: NotificationPagination;
  message?: string;
}

interface UnreadCountResponse {
  success: boolean;
  unreadCount?: number;
  message?: string;
}

interface NotificationActionResponse {
  success: boolean;
  message?: string;
  notification?: NotificationItem;
  updatedCount?: number;
}

export interface NotificationListFilters {
  page?: number;
  limit?: number;
  type?: string;
  is_read?: boolean;
}

export const fetchNotifications = async (
  filters: NotificationListFilters = {},
): Promise<NotificationListResponse> => {
  try {
    const params: Record<string, string | number | boolean> = {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    };

    if (filters.type) {
      params.type = filters.type;
    }

    if (typeof filters.is_read === 'boolean') {
      params.is_read = filters.is_read;
    }

    const response = await api.get<NotificationListResponse>(
      API_CONFIG.ENDPOINTS.NOTIFICATION.LIST,
      { params },
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<NotificationListResponse>;
    const errorData = axiosError.response?.data;
    const errorMessage = errorData
      ? getErrorMessage(errorData)
      : getErrorMessage(error);

    throw new CustomApiError(errorMessage, errorData);
  }
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  try {
    const response = await api.get<UnreadCountResponse>(
      API_CONFIG.ENDPOINTS.NOTIFICATION.UNREAD_COUNT,
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<UnreadCountResponse>;
    const errorData = axiosError.response?.data;
    const errorMessage = errorData
      ? getErrorMessage(errorData)
      : getErrorMessage(error);

    throw new CustomApiError(errorMessage, errorData);
  }
};

export const markAsRead = async (
  notificationId: string,
): Promise<NotificationActionResponse> => {
  try {
    const response = await api.put<NotificationActionResponse>(
      `${API_CONFIG.ENDPOINTS.NOTIFICATION.MARK_AS_READ}/${notificationId}/read`,
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<NotificationActionResponse>;
    const errorData = axiosError.response?.data;
    const errorMessage = errorData
      ? getErrorMessage(errorData)
      : getErrorMessage(error);

    throw new CustomApiError(errorMessage, errorData);
  }
};

export const markAllAsRead = async (): Promise<NotificationActionResponse> => {
  try {
    const response = await api.put<NotificationActionResponse>(
      API_CONFIG.ENDPOINTS.NOTIFICATION.MARK_ALL_AS_READ,
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<NotificationActionResponse>;
    const errorData = axiosError.response?.data;
    const errorMessage = errorData
      ? getErrorMessage(errorData)
      : getErrorMessage(error);

    throw new CustomApiError(errorMessage, errorData);
  }
};

export const deleteNotification = async (
  notificationId: string,
): Promise<NotificationActionResponse> => {
  try {
    const response = await api.delete<NotificationActionResponse>(
      `${API_CONFIG.ENDPOINTS.NOTIFICATION.DELETE}/${notificationId}`,
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<NotificationActionResponse>;
    const errorData = axiosError.response?.data;
    const errorMessage = errorData
      ? getErrorMessage(errorData)
      : getErrorMessage(error);

    throw new CustomApiError(errorMessage, errorData);
  }
};
