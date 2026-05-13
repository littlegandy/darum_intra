package kr.co.darumtech.intra.service.employee;

import kr.co.darumtech.intra.domain.employee.Department;
import kr.co.darumtech.intra.domain.employee.Employee;
import kr.co.darumtech.intra.domain.employee.Jobgrade;
import kr.co.darumtech.intra.domain.employee.Position;
import kr.co.darumtech.intra.dto.employee.CreateEmployeeRequest;
import kr.co.darumtech.intra.dto.employee.EmployeeDto;
import kr.co.darumtech.intra.dto.employee.UpdateEmployeeRequest;
import kr.co.darumtech.intra.repository.DepartmentRepository;
import kr.co.darumtech.intra.repository.EmployeeRepository;
import kr.co.darumtech.intra.repository.JobgradeRepository;
import kr.co.darumtech.intra.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private static final String DEFAULT_PASSWORD = "passw0rd!";

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final JobgradeRepository jobgradeRepository;
    private final PositionRepository positionRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 전체 직원 목록 조회
     */
    @Transactional(readOnly = true)
    public List<EmployeeDto> getAllEmployees(Boolean activeOnly) {
        return employeeRepository.findAllSorted(activeOnly).stream()
                .map(EmployeeDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 부서별 직원 목록 조회
     */
    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployeesByDepartment(Long deptno) {
        return employeeRepository.findByDepartment_Deptno(deptno).stream()
                .map(EmployeeDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 특정 직원 조회
     */
    @Transactional(readOnly = true)
    public EmployeeDto getEmployee(Long empno) {
        Employee employee = employeeRepository.findById(empno)
                .orElseThrow(() -> new RuntimeException("직원을 찾을 수 없습니다."));
        return EmployeeDto.fromEntity(employee);
    }

    /**
     * 내 정보 조회
     */
    @Transactional(readOnly = true)
    public EmployeeDto getMyInfo(String userId) {
        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return EmployeeDto.fromEntity(employee);
    }

    /**
     * 직원 생성 (ADMIN)
     */
    @Transactional
    public EmployeeDto createEmployee(CreateEmployeeRequest request) {
        // 중복 ID 체크
        if (employeeRepository.existsById(request.getId())) {
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }

        // Department 조회
        Department department = departmentRepository.findById(request.getDeptno())
                .orElseThrow(() -> new RuntimeException("부서를 찾을 수 없습니다."));

        // Jobgrade 조회 (optional)
        Jobgrade jobgrade = null;
        if (request.getJobno() != null) {
            jobgrade = jobgradeRepository.findById(request.getJobno())
                    .orElseThrow(() -> new RuntimeException("직급을 찾을 수 없습니다."));
        }

        // Position 조회 (optional)
        Position position = null;
        if (request.getPostno() != null) {
            position = positionRepository.findById(request.getPostno())
                    .orElseThrow(() -> new RuntimeException("직책을 찾을 수 없습니다."));
        }

        // Employee 생성
        Employee employee = new Employee();
        employee.setId(request.getId());
        String rawPassword = StringUtils.hasText(request.getPassword()) ? request.getPassword() : DEFAULT_PASSWORD;
        employee.setPassword(passwordEncoder.encode(rawPassword));
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setEntryDate(request.getEntryDate());
        employee.setLeaveDate(request.getLeaveDate());
        employee.setEmpState(request.getEmpState());
        employee.setIntraView(request.getIntraView());
        employee.setPermission(request.getPermission());
        employee.setDepartment(department);
        employee.setJobgrade(jobgrade);
        employee.setPosition(position);

        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Employee created: {}", savedEmployee.getId());

        return EmployeeDto.fromEntity(savedEmployee);
    }

    /**
     * 직원 수정 (ADMIN)
     */
    @Transactional
    public EmployeeDto updateEmployee(Long empno, UpdateEmployeeRequest request, String requesterId, boolean isAdmin) {
        Employee employee = employeeRepository.findById(empno)
                .orElseThrow(() -> new RuntimeException("직원을 찾을 수 없습니다."));

        if (!isAdmin && !employee.getId().equals(requesterId)) {
            throw new RuntimeException("본인 정보만 수정할 수 있습니다.");
        }

        // Department 조회
        Department department = departmentRepository.findById(request.getDeptno())
                .orElseThrow(() -> new RuntimeException("부서를 찾을 수 없습니다."));

        // Jobgrade 조회 (optional)
        Jobgrade jobgrade = null;
        if (request.getJobno() != null) {
            jobgrade = jobgradeRepository.findById(request.getJobno())
                    .orElseThrow(() -> new RuntimeException("직급을 찾을 수 없습니다."));
        }

        // Position 조회 (optional)
        Position position = null;
        if (request.getPostno() != null) {
            position = positionRepository.findById(request.getPostno())
                    .orElseThrow(() -> new RuntimeException("직책을 찾을 수 없습니다."));
        }

        // 정보 수정
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setEntryDate(request.getEntryDate());
        employee.setLeaveDate(request.getLeaveDate());
        employee.setEmpState(request.getEmpState());
        employee.setIntraView(request.getIntraView());
        if (isAdmin) {
            employee.setPermission(request.getPermission());
        }
        employee.setDepartment(department);
        employee.setJobgrade(jobgrade);
        employee.setPosition(position);
        if (StringUtils.hasText(request.getPassword())) {
          employee.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        log.info("Employee updated: {}", updatedEmployee.getId());

        return EmployeeDto.fromEntity(updatedEmployee);
    }

    /**
     * 직원 삭제 (ADMIN)
     */
    @Transactional
    public void deleteEmployee(Long empno) {
        Employee employee = employeeRepository.findById(empno)
                .orElseThrow(() -> new RuntimeException("직원을 찾을 수 없습니다."));

        employeeRepository.delete(employee);
        log.info("Employee deleted: {}", employee.getId());
    }
}
