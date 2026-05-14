/**
 * 스케줄 관련 TypeScript 타입 정의
 */

/**
 * 스케줄 DTO
 */
export interface Schedule {
  no: number;
  empno: number;
  deptno?: number;
  employeeName: string;
  departmentName?: string;
  departmentRank?: number;
  jobgradeName?: string;
  custno?: number;
  customerName?: string;
  prodno?: number;
  productName?: string;
  suppno?: number;
  supportName?: string;
  contents?: string;
  location?: string;
  workDate: string; // ISO date format (YYYY-MM-DD)
  stime?: string; // ISO time format (HH:mm:ss)
  rtime?: string;
  etime?: string;
  startNo?: number;
  holiday: boolean;
}

/**
 * 스케줄 생성 요청
 */
export interface CreateScheduleRequest {
  empno: number;
  custno?: number;
  prodno?: number;
  suppno?: number;
  contents?: string;
  location?: string;
  /**
   * 시작 날짜 (범위 방식 사용 시)
   * dates 필드가 있으면 무시됨
   */
  startDate?: string;
  /**
   * 종료 날짜 (범위 방식 사용 시)
   * dates 필드가 있으면 무시됨
   */
  endDate?: string;
  /**
   * 개별 날짜 목록 (직접 선택 방식)
   * 이 필드가 있으면 startDate/endDate보다 우선 처리됨
   */
  dates?: string[];
  stime?: string;
  rtime?: string;
  etime?: string;
  startNo?: number;
  holiday?: boolean;
}

/**
 * 스케줄 수정 요청
 */
export interface UpdateScheduleRequest {
  custno?: number;
  prodno?: number;
  suppno?: number;
  contents?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  stime?: string;
  rtime?: string;
  etime?: string;
  startNo?: number;
  holiday?: boolean;
}

/**
 * 스케줄 필터 조건
 */
export interface ScheduleFilter {
  empno?: number;
  deptno?: number;
  custno?: number;
  startDate: string;
  endDate: string;
  holiday?: boolean;
}
