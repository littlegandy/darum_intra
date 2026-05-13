package kr.co.darumtech.intra.repository.schedule;

import kr.co.darumtech.intra.domain.schedule.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * 스케줄 Repository
 */
@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    /**
     * 특정 직원의 스케줄 조회
     */
    List<Schedule> findByEmployee_Empno(Long empno);

    /**
     * 특정 직원의 기간별 스케줄 조회
     */
    @Query("SELECT s FROM Schedule s WHERE s.employee.empno = :empno " +
            "AND s.workDate BETWEEN :startDate AND :endDate " +
            "ORDER BY s.workDate ASC, s.stime ASC")
    List<Schedule> findByEmployeeAndDateRange(
            @Param("empno") Long empno,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * 특정 부서의 특정 날짜 스케줄 조회
     */
    @Query("SELECT s FROM Schedule s " +
            "WHERE s.employee.department.deptno = :deptno " +
            "AND s.workDate = :workDate " +
            "ORDER BY s.employee.department.deptno ASC, s.employee.position.postno ASC NULLS LAST, s.workDate DESC, s.stime ASC")
    List<Schedule> findByDepartmentAndDate(
            @Param("deptno") Long deptno,
            @Param("workDate") LocalDate workDate
    );

    /**
     * 특정 부서의 기간별 스케줄 조회
     */
    @Query("SELECT s FROM Schedule s " +
            "WHERE s.employee.department.deptno = :deptno " +
            "AND s.workDate BETWEEN :startDate AND :endDate " +
            "ORDER BY s.employee.department.deptno ASC, s.employee.position.postno ASC NULLS LAST, s.workDate DESC, s.stime ASC")
    List<Schedule> findByDepartmentAndDateRange(
            @Param("deptno") Long deptno,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * 특정 고객사의 기간별 스케줄 조회
     */
    @Query("SELECT s FROM Schedule s " +
            "WHERE s.customer.custno = :custno " +
            "AND s.workDate BETWEEN :startDate AND :endDate " +
            "ORDER BY s.workDate ASC, s.stime ASC")
    List<Schedule> findByCustomerAndDateRange(
            @Param("custno") Long custno,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * 특정 날짜의 모든 스케줄 조회
     */
    @Query("SELECT s FROM Schedule s WHERE s.workDate = :workDate " +
            "ORDER BY s.employee.department.deptno ASC, s.employee.empno ASC, s.stime ASC")
    List<Schedule> findByWorkDate(@Param("workDate") LocalDate workDate);

    /**
     * 기간별 모든 스케줄 조회
     */
    @Query("SELECT s FROM Schedule s WHERE s.workDate BETWEEN :startDate AND :endDate " +
            "ORDER BY s.workDate ASC, s.employee.department.deptno ASC, s.employee.empno ASC, s.stime ASC")
    List<Schedule> findByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * 휴일 여부로 필터링
     */
    @Query("SELECT s FROM Schedule s WHERE s.holiday = :holiday " +
            "AND s.workDate BETWEEN :startDate AND :endDate " +
            "ORDER BY s.workDate ASC, s.stime ASC")
    List<Schedule> findByHolidayAndDateRange(
            @Param("holiday") Boolean holiday,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    List<Schedule> findByStartNo(Long startNo);
}
