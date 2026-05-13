import apiClient from './axios';
import { unwrapResponseData } from './apiResponseHelper';
import type { ApiResponse, Employee } from '../types';

export const getEmployees = async (params?: { activeOnly?: boolean }): Promise<Employee[]> => {
  const response = await apiClient.get<ApiResponse<Employee[]>>('/api/v1/employees', { params });
  return unwrapResponseData(response);
};

export const getMyInfo = async (): Promise<Employee> => {
  const response = await apiClient.get<ApiResponse<Employee>>('/api/v1/employees/me');
  return unwrapResponseData(response);
};

export const createEmployee = async (payload: any): Promise<Employee> => {
  const res = await apiClient.post<ApiResponse<Employee>>('/api/v1/employees', payload);
  return unwrapResponseData(res);
};

export const updateEmployeeApi = async (empno: number, payload: any): Promise<Employee> => {
  const res = await apiClient.put<ApiResponse<Employee>>(`/api/v1/employees/${empno}`, payload);
  return unwrapResponseData(res);
};

export const deleteEmployeeApi = async (empno: number): Promise<void> => {
  await apiClient.delete(`/api/v1/employees/${empno}`);
};
