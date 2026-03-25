import { api } from './authService';
import { CustomApiError } from '../utils/errorHandler';
import { getErrorMessage } from '../utils/validation';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string | null;
  role: 'STUDENT' | 'LECTURER' | 'FACILITY_MANAGER' | 'ADMINISTRATOR';
  status: string;
  is_email_verified?: boolean;
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  data?: UserProfile;
}

interface UpdateProfilePayload {
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const getMyProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await api.get<ProfileResponse>('/users/me');
    return response.data;
  } catch (error) {
    const errorData = (error as { response?: { data?: ProfileResponse } })?.response?.data;
    const message = errorData ? getErrorMessage(errorData) : getErrorMessage(error);
    throw new CustomApiError(message, errorData);
  }
};

export const updateMyProfile = async (
  payload: UpdateProfilePayload,
): Promise<ProfileResponse> => {
  try {
    const response = await api.put<ProfileResponse>('/users/me', payload);
    return response.data;
  } catch (error) {
    const errorData = (error as { response?: { data?: ProfileResponse } })?.response?.data;
    const message = errorData ? getErrorMessage(errorData) : getErrorMessage(error);
    throw new CustomApiError(message, errorData);
  }
};

export const changeMyPassword = async (
  payload: ChangePasswordPayload,
): Promise<ProfileResponse> => {
  try {
    const response = await api.put<ProfileResponse>('/users/me/password', payload);
    return response.data;
  } catch (error) {
    const errorData = (error as { response?: { data?: ProfileResponse } })?.response?.data;
    const message = errorData ? getErrorMessage(errorData) : getErrorMessage(error);
    throw new CustomApiError(message, errorData);
  }
};
