package kr.co.darumtech.intra.controller;

import jakarta.validation.Valid;
import kr.co.darumtech.intra.dto.ApiResponse;
import kr.co.darumtech.intra.dto.auth.*;
import kr.co.darumtech.intra.service.auth.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for user: {}", request.getId());

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(ApiResponse.success("로그인 성공", response));
    }

    /**
     * Access Token 갱신
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh requested");

        TokenResponse response = authService.refreshAccessToken(request.getRefreshToken());

        return ResponseEntity.ok(ApiResponse.success("토큰 갱신 성공", response));
    }

    /**
     * 비밀번호 변경
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        log.info("Password change requested for user: {}", userDetails.getUsername());

        authService.changePassword(userDetails.getUsername(), request);

        return ResponseEntity.ok(ApiResponse.success("비밀번호가 성공적으로 변경되었습니다.", null));
    }

    /**
     * 로그아웃
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("Logout requested for user: {}", userDetails.getUsername());

        authService.logout();

        return ResponseEntity.ok(ApiResponse.success("로그아웃 성공", null));
    }
}
