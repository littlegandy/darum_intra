import apiClient from './axios';
import { unwrapResponseData } from './apiResponseHelper';
import type { ApiResponse } from '../types';

export interface Jobgrade {
  jobno: number;
  jobName: string;
}

export const getJobgrades = async (): Promise<Jobgrade[]> => {
  const res = await apiClient.get<ApiResponse<Jobgrade[]>>('/api/v1/master/jobgrades');
  return unwrapResponseData(res);
};

export const createJobgradeApi = async (payload: { jobName: string }) => {
  const res = await apiClient.post<ApiResponse<Jobgrade>>('/api/v1/master/jobgrades', payload);
  return unwrapResponseData(res);
};

export const updateJobgradeApi = async (jobno: number, payload: { jobName: string }) => {
  const res = await apiClient.put<ApiResponse<Jobgrade>>(`/api/v1/master/jobgrades/${jobno}`, payload);
  return unwrapResponseData(res);
};

export const deleteJobgradeApi = async (jobno: number) => {
  await apiClient.delete(`/api/v1/master/jobgrades/${jobno}`);
};
