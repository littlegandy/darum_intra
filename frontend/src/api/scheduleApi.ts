import apiClient from './axios';
import { unwrapResponseData } from './apiResponseHelper';
import type {
  ApiResponse,
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '../types';

/**
 * 스케줄 API 클라이언트
 */

/**
 * 내 스케줄 조회 (기간별)
 */
export const getMySchedules = async (
  startDate: string,
  endDate: string
): Promise<Schedule[]> => {
  const response = await apiClient.get<ApiResponse<Schedule[]>>('/api/v1/schedules/me', {
    params: { startDate, endDate },
  });
  return unwrapResponseData(response);
};

/**
 * 특정 직원의 스케줄 조회 (기간별)
 */
export const getEmployeeSchedules = async (
  empno: number,
  startDate: string,
  endDate: string
): Promise<Schedule[]> => {
  const response = await apiClient.get<ApiResponse<Schedule[]>>(
    `/api/v1/schedules/employee/${empno}`,
    {
      params: { startDate, endDate },
    }
  );
  return unwrapResponseData(response);
};

/**
 * 부서별 스케줄 조회 (특정 날짜)
 */
export const getDepartmentSchedulesByDate = async (
  deptno: number,
  workDate: string
): Promise<Schedule[]> => {
  const response = await apiClient.get<ApiResponse<Schedule[]>>(
    `/api/v1/schedules/department/${deptno}`,
    {
      params: { workDate },
    }
  );
  return unwrapResponseData(response);
};

/**
 * 부서별 스케줄 조회 (기간별)
 */
export const getDepartmentSchedulesByDateRange = async (
  deptno: number,
  startDate: string,
  endDate: string
): Promise<Schedule[]> => {
  const response = await apiClient.get<ApiResponse<Schedule[]>>(
    `/api/v1/schedules/department/${deptno}/range`,
    {
      params: { startDate, endDate },
    }
  );
  return unwrapResponseData(response);
};

/**
 * 고객사별 스케줄 조회 (기간별) - ADMIN 전용
 */
export const getCustomerSchedules = async (
  custno: number,
  startDate: string,
  endDate: string
): Promise<Schedule[]> => {
  const response = await apiClient.get<ApiResponse<Schedule[]>>(
    `/api/v1/schedules/customer/${custno}`,
    {
      params: { startDate, endDate },
    }
  );
  return unwrapResponseData(response);
};

/**
 * 전체 스케줄 조회 (기간별) - ADMIN 전용
 */
export const getAllSchedules = async (
  startDate: string,
  endDate: string
): Promise<Schedule[]> => {
  const response = await apiClient.get<ApiResponse<Schedule[]>>('/api/v1/schedules', {
    params: { startDate, endDate },
  });
  return unwrapResponseData(response);
};

/**
 * 스케줄 상세 조회
 */
export const getSchedule = async (scheduleId: number): Promise<Schedule> => {
  const response = await apiClient.get<ApiResponse<Schedule>>(
    `/api/v1/schedules/${scheduleId}`
  );
  return unwrapResponseData(response);
};

/**
 * 스케줄 생성
 */
export const createSchedule = async (
  request: CreateScheduleRequest
): Promise<Schedule> => {
  const response = await apiClient.post<ApiResponse<Schedule>>(
    '/api/v1/schedules',
    request
  );
  return unwrapResponseData(response);
};

/**
 * 스케줄 수정
 */
export const updateSchedule = async (
  scheduleId: number,
  request: UpdateScheduleRequest
): Promise<Schedule> => {
  const response = await apiClient.put<ApiResponse<Schedule>>(
    `/api/v1/schedules/${scheduleId}`,
    request
  );
  return unwrapResponseData(response);
};

/**
 * 스케줄 삭제
 */
export const deleteSchedule = async (scheduleId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/schedules/${scheduleId}`);
};
export const deleteScheduleWithGroup = async (scheduleId: number, deleteGroup: boolean): Promise<void> => {
  await apiClient.delete(`/api/v1/schedules/${scheduleId}`, { params: { deleteGroup } });
};

/**
 * 연속 스케줄 생성 (일괄 생성)
 */
export const createBatchSchedules = async (
  requests: CreateScheduleRequest[]
): Promise<Schedule[]> => {
  const response = await apiClient.post<ApiResponse<Schedule[]>>(
    '/api/v1/schedules/batch',
    requests
  );
  return unwrapResponseData(response);
};
