package kr.co.darumtech.intra.dto.schedule;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 스케줄 생성 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateScheduleRequest {

    @NotNull(message = "직원 번호는 필수입니다")
    private Long empno;

    private Long custno;
    private Long prodno;
    private Long suppno;

    private String contents;
    private String location;

    @NotNull(message = "시작 날짜는 필수입니다")
    private LocalDate startDate;

    @NotNull(message = "종료 날짜는 필수입니다")
    private LocalDate endDate;

    private LocalTime stime;
    private LocalTime rtime;
    private LocalTime etime;
    private Long startNo;
    /**
     * 휴일 포함 여부 (토글)
     */
    private Boolean holiday;
}
