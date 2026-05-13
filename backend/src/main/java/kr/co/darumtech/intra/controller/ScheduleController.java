package kr.co.darumtech.intra.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.co.darumtech.intra.dto.ApiResponse;
import kr.co.darumtech.intra.dto.schedule.CreateScheduleRequest;
import kr.co.darumtech.intra.dto.schedule.ScheduleDto;
import kr.co.darumtech.intra.dto.schedule.UpdateScheduleRequest;
import kr.co.darumtech.intra.service.schedule.ScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Schedule REST API controller.
 */
@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Schedule", description = "Schedule API")
public class ScheduleController {

    private final ScheduleService scheduleService;

    /**
     * Get my schedules (date range).
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Get my schedules", description = "Returns schedules for the current user in a date range.")
    public ResponseEntity<ApiResponse<List<ScheduleDto>>> getMySchedules(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        List<ScheduleDto> schedules = scheduleService.getMySchedules(userId, startDate, endDate);

        return ResponseEntity.ok(ApiResponse.success(
                "Schedules fetched.",
                schedules
        ));
    }

    /**
     * Get schedules for a specific employee (date range).
     */
    @GetMapping("/employee/{empno}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Get employee schedules", description = "Returns schedules for a specific employee in a date range.")
    public ResponseEntity<ApiResponse<List<ScheduleDto>>> getEmployeeSchedules(
            @PathVariable Long empno,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<ScheduleDto> schedules = scheduleService.getEmployeeSchedules(empno, startDate, endDate);

        return ResponseEntity.ok(ApiResponse.success(
                "Employee schedules fetched.",
                schedules
        ));
    }

    /**
     * Get department schedules for a specific date.
     */
    @GetMapping("/department/{deptno}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Get department schedules by date", description = "Returns department schedules for a single date.")
    public ResponseEntity<ApiResponse<List<ScheduleDto>>> getDepartmentSchedulesByDate(
            @PathVariable Long deptno,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDate
    ) {
        List<ScheduleDto> schedules = scheduleService.getDepartmentSchedulesByDate(deptno, workDate);

        return ResponseEntity.ok(ApiResponse.success(
                "Department schedules fetched.",
                schedules
        ));
    }

    /**
     * Get department schedules for a date range.
     */
    @GetMapping("/department/{deptno}/range")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Get department schedules by date range", description = "Returns department schedules for a date range.")
    public ResponseEntity<ApiResponse<List<ScheduleDto>>> getDepartmentSchedulesByDateRange(
            @PathVariable Long deptno,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<ScheduleDto> schedules = scheduleService.getDepartmentSchedulesByDateRange(deptno, startDate, endDate);

        return ResponseEntity.ok(ApiResponse.success(
                "Department schedules fetched.",
                schedules
        ));
    }

    /**
     * Get customer schedules (admin only).
     */
    @GetMapping("/customer/{custno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Get customer schedules", description = "Returns customer schedules for a date range (admin only).")
    public ResponseEntity<ApiResponse<List<ScheduleDto>>> getCustomerSchedules(
            @PathVariable Long custno,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<ScheduleDto> schedules = scheduleService.getCustomerSchedules(custno, startDate, endDate);

        return ResponseEntity.ok(ApiResponse.success(
                "Customer schedules fetched.",
                schedules
        ));
    }

    /**
     * Get all schedules (admin only).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Get all schedules", description = "Returns all schedules for a date range.")
    public ResponseEntity<ApiResponse<List<ScheduleDto>>> getAllSchedules(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<ScheduleDto> schedules = scheduleService.getAllSchedules(startDate, endDate);

        return ResponseEntity.ok(ApiResponse.success(
                "All schedules fetched.",
                schedules
        ));
    }

    /**
     * Get schedule by id.
     */
    @GetMapping("/{scheduleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Get schedule", description = "Returns a single schedule by id.")
    public ResponseEntity<ApiResponse<ScheduleDto>> getSchedule(
            @PathVariable Long scheduleId
    ) {
        ScheduleDto schedule = scheduleService.getSchedule(scheduleId);

        return ResponseEntity.ok(ApiResponse.success(
                "Schedule fetched.",
                schedule
        ));
    }

    /**
     * Create schedule.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Create schedule", description = "Creates a schedule (single or range).")
    public ResponseEntity<ApiResponse<ScheduleDto>> createSchedule(
            @Valid @RequestBody CreateScheduleRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);

        ScheduleDto schedule = scheduleService.createSchedule(request, userId, isAdmin);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Schedule created.",
                schedule
        ));
    }

    /**
     * Update schedule.
     */
    @PutMapping("/{scheduleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Update schedule", description = "Updates a schedule (single or group).")
    public ResponseEntity<ApiResponse<ScheduleDto>> updateSchedule(
            @PathVariable Long scheduleId,
            @Valid @RequestBody UpdateScheduleRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);

        ScheduleDto schedule = scheduleService.updateSchedule(scheduleId, request, userId, isAdmin);

        return ResponseEntity.ok(ApiResponse.success(
                "Schedule updated.",
                schedule
        ));
    }

    /**
     * Delete schedule.
     */
    @DeleteMapping("/{scheduleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Delete schedule", description = "Deletes a schedule (single or group).")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @PathVariable Long scheduleId,
            @RequestParam(value = "deleteGroup", defaultValue = "false") boolean deleteGroup,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);

        scheduleService.deleteSchedule(scheduleId, userId, isAdmin, deleteGroup);

        return ResponseEntity.ok(ApiResponse.success(
                "Schedule deleted.",
                null
        ));
    }

    /**
     * Create schedules in batch.
     */
    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Create batch schedules", description = "Creates schedules in batch.")
    public ResponseEntity<ApiResponse<List<ScheduleDto>>> createBatchSchedules(
            @Valid @RequestBody List<CreateScheduleRequest> requests,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        boolean isAdmin = hasAdminRole(authentication);

        List<ScheduleDto> schedules = scheduleService.createBatchSchedules(requests, userId, isAdmin);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Batch schedules created.",
                schedules
        ));
    }

    private boolean hasAdminRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPERADMIN"));
    }
}
