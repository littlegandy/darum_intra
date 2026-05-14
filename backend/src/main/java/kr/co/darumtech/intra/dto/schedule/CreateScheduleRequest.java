package kr.co.darumtech.intra.dto.schedule;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

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

    /**
     * 시작 날짜 (범위 방식 사용 시)
     * dates 필드가 있으면 무시됨
     */
    private LocalDate startDate;

    /**
     * 종료 날짜 (범위 방식 사용 시)
     * dates 필드가 있으면 무시됨
     */
    private LocalDate endDate;

    /**
     * 개별 날짜 목록 (직접 선택 방식)
     * 이 필드가 있으면 startDate/endDate보다 우선 처리됨
     */
    private List<LocalDate> dates;

    private LocalTime stime;
    private LocalTime rtime;
    private LocalTime etime;
    private Long startNo;
    /**
     * 휴일 포함 여부 (토글)
     */
    private Boolean holiday;
}
