import apiClient from './axios';
import { unwrapResponseData } from './apiResponseHelper';
import type { ApiResponse } from '../types';

/**
 * 대시보드 통계 타입
 */
export interface DashboardStats {
  // 오늘 일정
  todayScheduleCount: number;
  todayWorkScheduleCount: number;
  todayHolidayCount: number;

  // 이번 주 일정
  weekScheduleCount?: number;
  weekWorkScheduleCount?: number;
  weekHolidayCount?: number;

  // 이번 달 일정
  monthScheduleCount: number;
  monthWorkScheduleCount: number;
  monthHolidayCount: number;

  // 전체 통계 (관리자용)
  totalEmployees?: number;
  totalCustomers?: number;
  totalSchedulesThisMonth?: number;
}

/**
 * 대시보드 API 클라이언트
 */

/**
 * 내 대시보드 통계 조회
 */
export const getMyDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<ApiResponse<DashboardStats>>(
    '/api/v1/dashboard/my-stats'
  );
  return unwrapResponseData(response);
};

/**
 * 전체 대시보드 통계 조회 (관리자용)
 */
export const getAdminDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<ApiResponse<DashboardStats>>(
    '/api/v1/dashboard/admin-stats'
  );
  return unwrapResponseData(response);
};
