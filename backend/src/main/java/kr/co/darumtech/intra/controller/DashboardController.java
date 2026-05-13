package kr.co.darumtech.intra.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.darumtech.intra.dto.ApiResponse;
import kr.co.darumtech.intra.dto.dashboard.DashboardStatsDto;
import kr.co.darumtech.intra.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Dashboard REST API controller.
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard", description = "Dashboard API")
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Get dashboard stats for the current user.
     */
    @GetMapping("/my-stats")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Get my dashboard stats", description = "Returns dashboard statistics for the current user.")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getMyDashboardStats(
            Authentication authentication
    ) {
        String userId = authentication.getName();
        DashboardStatsDto stats = dashboardService.getMyDashboardStats(userId);

        return ResponseEntity.ok(ApiResponse.success(
                "Dashboard stats fetched.",
                stats
        ));
    }

    /**
     * Get dashboard stats for admins.
     */
    @GetMapping("/admin-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Get admin dashboard stats", description = "Returns overall dashboard statistics for admins.")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getAdminDashboardStats() {
        DashboardStatsDto stats = dashboardService.getAdminDashboardStats();

        return ResponseEntity.ok(ApiResponse.success(
                "Admin dashboard stats fetched.",
                stats
        ));
    }
}
