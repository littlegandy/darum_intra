package kr.co.darumtech.intra.dto.auth;

import kr.co.darumtech.intra.domain.employee.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private UserInfo user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String id;
        private Long empno;
        private String name;
        private Role role;
        private String departmentName;
        private String jobgradeName;
        private String positionName;
    }
}
