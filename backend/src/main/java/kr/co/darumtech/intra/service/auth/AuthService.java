package kr.co.darumtech.intra.service.auth;

import kr.co.darumtech.intra.domain.employee.Employee;
import kr.co.darumtech.intra.dto.auth.ChangePasswordRequest;
import kr.co.darumtech.intra.dto.auth.LoginRequest;
import kr.co.darumtech.intra.dto.auth.LoginResponse;
import kr.co.darumtech.intra.dto.auth.TokenResponse;
import kr.co.darumtech.intra.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenStore refreshTokenStore;

    /**
     * Login.
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getId(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        Employee employee = employeeRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("User not found."));

        String accessToken = jwtTokenProvider.createAccessToken(
                employee.getId(),
                employee.getEmpno(),
                employee.getName(),
                employee.getPermission()
        );

        String refreshToken = jwtTokenProvider.createRefreshToken(employee.getId());
        refreshTokenStore.save(employee.getId(), refreshToken);

        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                .id(employee.getId())
                .empno(employee.getEmpno())
                .name(employee.getName())
                .role(employee.getPermission())
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getDeptName() : null)
                .jobgradeName(employee.getJobgrade() != null ? employee.getJobgrade().getJobName() : null)
                .positionName(employee.getPosition() != null ? employee.getPosition().getPostName() : null)
                .build();

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userInfo)
                .build();
    }

    /**
     * Refresh access token.
     */
    @Transactional(readOnly = true)
    public TokenResponse refreshAccessToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token.");
        }

        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);

        if (!refreshTokenStore.isValid(userId, refreshToken)) {
            throw new RuntimeException("Refresh token does not match stored token.");
        }

        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));

        String newAccessToken = jwtTokenProvider.createAccessToken(
                employee.getId(),
                employee.getEmpno(),
                employee.getName(),
                employee.getPermission()
        );

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .build();
    }

    /**
     * Change password.
     */
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), employee.getPassword())) {
            throw new RuntimeException("Current password does not match.");
        }

        employee.setPassword(passwordEncoder.encode(request.getNewPassword()));
        employeeRepository.save(employee);

        log.info("Password changed for user: {}", userId);
    }

    /**
     * Logout (revoke refresh token).
     */
    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            refreshTokenStore.revoke(authentication.getName());
        }
        SecurityContextHolder.clearContext();
    }
}
