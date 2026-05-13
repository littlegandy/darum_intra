package kr.co.darumtech.intra.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 대시보드 통계 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {

    // 오늘 일정
    private Long todayScheduleCount;
    private Long todayWorkScheduleCount;
    private Long todayHolidayCount;

    // 이번 주 일정
    private Long weekScheduleCount;
    private Long weekWorkScheduleCount;
    private Long weekHolidayCount;

    // 이번 달 일정
    private Long monthScheduleCount;
    private Long monthWorkScheduleCount;
    private Long monthHolidayCount;

    // 전체 통계 (관리자용)
    private Long totalEmployees;
    private Long totalCustomers;
    private Long totalSchedulesThisMonth;
}
