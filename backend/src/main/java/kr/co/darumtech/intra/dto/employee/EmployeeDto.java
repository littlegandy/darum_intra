package kr.co.darumtech.intra.dto.employee;

import kr.co.darumtech.intra.domain.employee.Employee;
import kr.co.darumtech.intra.domain.employee.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {

    private Long empno;
    private String id;
    private String name;
    private String email;
    private String phone;
    private LocalDate entryDate;
    private LocalDate leaveDate;
    private Boolean empState;
    private Boolean intraView;
    private Role permission;

    // Department info
    private Long deptno;
    private String departmentName;

    // Jobgrade info
    private Long jobno;
    private String jobgradeName;

    // Position info
    private Long postno;
    private String positionName;

    /**
     * Entity to DTO
     */
    public static EmployeeDto fromEntity(Employee employee) {
        return EmployeeDto.builder()
                .empno(employee.getEmpno())
                .id(employee.getId())
                .name(employee.getName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .entryDate(employee.getEntryDate())
                .leaveDate(employee.getLeaveDate())
                .empState(employee.getEmpState())
                .intraView(employee.getIntraView())
                .permission(employee.getPermission())
                .deptno(employee.getDepartment() != null ? employee.getDepartment().getDeptno() : null)
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getDeptName() : null)
                .jobno(employee.getJobgrade() != null ? employee.getJobgrade().getJobno() : null)
                .jobgradeName(employee.getJobgrade() != null ? employee.getJobgrade().getJobName() : null)
                .postno(employee.getPosition() != null ? employee.getPosition().getPostno() : null)
                .positionName(employee.getPosition() != null ? employee.getPosition().getPostName() : null)
                .build();
    }
}
