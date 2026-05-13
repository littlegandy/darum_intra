package kr.co.darumtech.intra.dto.employee;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import kr.co.darumtech.intra.domain.employee.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {

    @NotBlank(message = "?勳澊?旊? ?呺牓?挫＜?胳殧.")
    private String id;

    @NotBlank(message = "牍勲?氩堩樃毳??呺牓?挫＜?胳殧.")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$",
            message = "Password must be at least 8 characters and include letters, numbers, and special characters."
    )
    private String password;

    @NotBlank(message = "?措???呺牓?挫＜?胳殧.")
    private String name;

    @Email(message = "?皵毳??措⿺???曥嫕???勲嫏?堧嫟.")
    private String email;

    private String phone;

    @NotNull(message = "?呾偓?检潉 ?呺牓?挫＜?胳殧.")
    private LocalDate entryDate;
    private LocalDate leaveDate;
    private Boolean empState;
    private Boolean intraView;

    @NotNull(message = "甓岉暅???犿儩?挫＜?胳殧.")
    private Role permission;

    @NotNull(message = "攵€?滊? ?犿儩?挫＜?胳殧.")
    private Long deptno;

    private Long jobno;

    private Long postno;
}
