import apiClient from './axios';
import { unwrapResponseData } from './apiResponseHelper';
import type { ApiResponse } from '../types';

export interface Position {
  postno: number;
  postName: string;
}

export const getPositions = async (): Promise<Position[]> => {
  const res = await apiClient.get<ApiResponse<Position[]>>('/api/v1/master/positions');
  return unwrapResponseData(res);
};

export const createPositionApi = async (payload: { postName: string }) => {
  const res = await apiClient.post<ApiResponse<Position>>('/api/v1/master/positions', payload);
  return unwrapResponseData(res);
};

export const updatePositionApi = async (postno: number, payload: { postName: string }) => {
  const res = await apiClient.put<ApiResponse<Position>>(`/api/v1/master/positions/${postno}`, payload);
  return unwrapResponseData(res);
};

export const deletePositionApi = async (postno: number) => {
  await apiClient.delete(`/api/v1/master/positions/${postno}`);
};
