package kr.co.darumtech.intra.service.dashboard;

import kr.co.darumtech.intra.domain.employee.Employee;
import kr.co.darumtech.intra.dto.dashboard.DashboardStatsDto;
import kr.co.darumtech.intra.repository.CustomerRepository;
import kr.co.darumtech.intra.repository.EmployeeRepository;
import kr.co.darumtech.intra.repository.schedule.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

/**
 * 대시보드 통계 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class DashboardService {

    private final ScheduleRepository scheduleRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;

    /**
     * 내 대시보드 통계 조회
     */
    public DashboardStatsDto getMyDashboardStats(String userId) {
        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("직원을 찾을 수 없습니다: " + userId));

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.with(TemporalAdjusters.lastDayOfMonth());

        // 오늘 일정
        var todaySchedules = scheduleRepository.findByEmployeeAndDateRange(
                employee.getEmpno(), today, today
        );
        long todayTotal = todaySchedules.size();
        long todayWork = todaySchedules.stream().filter(s -> !s.getHoliday()).count();
        long todayHoliday = todaySchedules.stream().filter(s -> s.getHoliday()).count();

        // 이번 주 일정
        var weekSchedules = scheduleRepository.findByEmployeeAndDateRange(
                employee.getEmpno(), weekStart, weekEnd
        );
        long weekTotal = weekSchedules.size();
        long weekWork = weekSchedules.stream().filter(s -> !s.getHoliday()).count();
        long weekHoliday = weekSchedules.stream().filter(s -> s.getHoliday()).count();

        // 이번 달 일정
        var monthSchedules = scheduleRepository.findByEmployeeAndDateRange(
                employee.getEmpno(), monthStart, monthEnd
        );
        long monthTotal = monthSchedules.size();
        long monthWork = monthSchedules.stream().filter(s -> !s.getHoliday()).count();
        long monthHoliday = monthSchedules.stream().filter(s -> s.getHoliday()).count();

        return DashboardStatsDto.builder()
                .todayScheduleCount(todayTotal)
                .todayWorkScheduleCount(todayWork)
                .todayHolidayCount(todayHoliday)
                .weekScheduleCount(weekTotal)
                .weekWorkScheduleCount(weekWork)
                .weekHolidayCount(weekHoliday)
                .monthScheduleCount(monthTotal)
                .monthWorkScheduleCount(monthWork)
                .monthHolidayCount(monthHoliday)
                .build();
    }

    /**
     * 전체 대시보드 통계 조회 (관리자용)
     */
    public DashboardStatsDto getAdminDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.with(TemporalAdjusters.lastDayOfMonth());

        // 오늘 일정
        var todaySchedules = scheduleRepository.findByWorkDate(today);
        long todayTotal = todaySchedules.size();
        long todayWork = todaySchedules.stream().filter(s -> !s.getHoliday()).count();
        long todayHoliday = todaySchedules.stream().filter(s -> s.getHoliday()).count();

        // 이번 달 일정
        var monthSchedules = scheduleRepository.findByDateRange(monthStart, monthEnd);
        long monthTotal = monthSchedules.size();
        long monthWork = monthSchedules.stream().filter(s -> !s.getHoliday()).count();
        long monthHoliday = monthSchedules.stream().filter(s -> s.getHoliday()).count();

        // 전체 통계
        long totalEmployees = employeeRepository.count();
        long totalCustomers = customerRepository.count();

        return DashboardStatsDto.builder()
                .todayScheduleCount(todayTotal)
                .todayWorkScheduleCount(todayWork)
                .todayHolidayCount(todayHoliday)
                .monthScheduleCount(monthTotal)
                .monthWorkScheduleCount(monthWork)
                .monthHolidayCount(monthHoliday)
                .totalEmployees(totalEmployees)
                .totalCustomers(totalCustomers)
                .totalSchedulesThisMonth(monthTotal)
                .build();
    }
}
