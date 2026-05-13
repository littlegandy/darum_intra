package kr.co.darumtech.intra.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 스케줄 수정 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateScheduleRequest {

    private Long custno;
    private Long prodno;
    private Long suppno;

    private String contents;
    private String location;

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime stime;
    private LocalTime rtime;
    private LocalTime etime;
    private Long startNo;
    private Boolean holiday;
    /**
     * true면 같은 startNo 묶음 전체에 적용
     */
    private Boolean applyGroup;
}
