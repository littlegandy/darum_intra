package kr.co.darumtech.intra.controller;

import jakarta.validation.Valid;
import kr.co.darumtech.intra.dto.ApiResponse;
import kr.co.darumtech.intra.dto.employee.CreateEmployeeRequest;
import kr.co.darumtech.intra.dto.employee.EmployeeDto;
import kr.co.darumtech.intra.dto.employee.UpdateEmployeeRequest;
import kr.co.darumtech.intra.service.employee.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    /**
     * 전체 직원 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeDto>>> getAllEmployees(
            @RequestParam(value = "activeOnly", required = false, defaultValue = "true") boolean activeOnly
    ) {
        log.info("Get all employees, activeOnly={}", activeOnly);

        List<EmployeeDto> employees = employeeService.getAllEmployees(activeOnly);

        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    /**
     * 부서별 직원 목록 조회
     */
    @GetMapping("/department/{deptno}")
    public ResponseEntity<ApiResponse<List<EmployeeDto>>> getEmployeesByDepartment(@PathVariable Long deptno) {
        log.info("Get employees by department: {}", deptno);

        List<EmployeeDto> employees = employeeService.getEmployeesByDepartment(deptno);

        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    /**
     * 특정 직원 조회
     */
    @GetMapping("/{empno}")
    public ResponseEntity<ApiResponse<EmployeeDto>> getEmployee(@PathVariable Long empno) {
        log.info("Get employee: {}", empno);

        EmployeeDto employee = employeeService.getEmployee(empno);

        return ResponseEntity.ok(ApiResponse.success(employee));
    }

    /**
     * 내 정보 조회
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<EmployeeDto>> getMyInfo(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("Get my info: {}", userDetails.getUsername());

        EmployeeDto employee = employeeService.getMyInfo(userDetails.getUsername());

        return ResponseEntity.ok(ApiResponse.success(employee));
    }

    /**
     * 직원 생성 (ADMIN만 가능)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<EmployeeDto>> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        log.info("Create employee: {}", request.getId());

        EmployeeDto employee = employeeService.createEmployee(request);

        return ResponseEntity.ok(ApiResponse.success("직원이 성공적으로 생성되었습니다.", employee));
    }

    /**
     * 직원 수정 (ADMIN만 가능)
     */
    @PutMapping("/{empno}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<EmployeeDto>> updateEmployee(
            @PathVariable Long empno,
            @Valid @RequestBody UpdateEmployeeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Update employee: {}", empno);

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPERADMIN"));

        EmployeeDto employee = employeeService.updateEmployee(empno, request, userDetails.getUsername(), isAdmin);

        return ResponseEntity.ok(ApiResponse.success("직원 정보가 성공적으로 수정되었습니다.", employee));
    }

    /**
     * 직원 삭제 (ADMIN만 가능)
     */
    @DeleteMapping("/{empno}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long empno) {
        log.info("Delete employee: {}", empno);

        employeeService.deleteEmployee(empno);

        return ResponseEntity.ok(ApiResponse.success("직원이 성공적으로 삭제되었습니다.", null));
    }
}
