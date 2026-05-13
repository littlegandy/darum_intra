package kr.co.darumtech.intra.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 스케줄 필터링 조회 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleFilterRequest {

    private Long empno;
    private Long deptno;
    private Long custno;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean holiday;
}
