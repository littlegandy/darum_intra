package kr.co.darumtech.intra.service.auth;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 간단한 Refresh Token 저장소 (사용자당 1개 토큰 유지)
 */
@Component
public class RefreshTokenStore {

    private final Map<String, String> store = new ConcurrentHashMap<>();

    public void save(String userId, String refreshToken) {
        store.put(userId, refreshToken);
    }

    public boolean isValid(String userId, String refreshToken) {
        String saved = store.get(userId);
        return saved != null && saved.equals(refreshToken);
    }

    public void revoke(String userId) {
        store.remove(userId);
    }
}
