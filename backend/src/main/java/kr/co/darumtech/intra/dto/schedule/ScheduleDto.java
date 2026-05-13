package kr.co.darumtech.intra.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 스케줄 조회 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleDto {

    private Long no;

    // 직원 정보
    private Long empno;
    private Long deptno;
    private String employeeName;
    private String departmentName;
    private Integer departmentRank;
    private String jobgradeName;

    // 고객사 정보 (선택)
    private Long custno;
    private String customerName;

    // 제품 정보 (선택)
    private Long prodno;
    private String productName;

    // 지원유형 정보 (선택)
    private Long suppno;
    private String supportName;

    // 일정 상세
    private String contents;
    private String location;
    private LocalDate workDate;
    private LocalTime stime;
    private LocalTime rtime;
    private LocalTime etime;
    private Long startNo;
    private Boolean holiday;
}
