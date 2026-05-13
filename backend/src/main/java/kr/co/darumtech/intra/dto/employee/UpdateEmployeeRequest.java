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
public class UpdateEmployeeRequest {

    @NotBlank(message = "?´ë¦„???…ë ¥?´ì£¼?¸ìš”.")
    private String name;

    @Pattern(
            regexp = "^(?:(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,})?$",
            message = "Password must be at least 8 characters and include letters, numbers, and special characters."
    )
    private String password;

    @Email(message = "Invalid email format.")
    private String email;

    private String phone;

    @NotNull(message = "?…ì‚¬?¼ì„ ?…ë ¥?´ì£¼?¸ìš”.")
    private LocalDate entryDate;
    private LocalDate leaveDate;
    private Boolean empState;
    private Boolean intraView;

    @NotNull(message = "ê¶Œí•œ??? íƒ?´ì£¼?¸ìš”.")
    private Role permission;

    @NotNull(message = "ë¶€?œë? ? íƒ?´ì£¼?¸ìš”.")
    private Long deptno;

    private Long jobno;

    private Long postno;
}
