import apiClient from './axios';
import { LoginRequest, LoginResponse, ApiResponse } from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', data);
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
  },
};
