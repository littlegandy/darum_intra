package kr.co.darumtech.intra.service.auth;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

@Slf4j
@Component
public class JwtSecretProvider {

    @Getter
    private final String secret;

    public JwtSecretProvider(@Value("${jwt.secret:}") String configuredSecret) {
        if (configuredSecret != null && !configuredSecret.isBlank() && isStrongEnough(configuredSecret)) {
            this.secret = configuredSecret;
        } else {
            this.secret = generateRandomSecret();
            log.warn("jwt.secret was missing or too short; generated a random secret for this runtime.");
        }
    }

    private boolean isStrongEnough(String secretValue) {
        return secretValue.getBytes(java.nio.charset.StandardCharsets.UTF_8).length >= 32;
    }

    private String generateRandomSecret() {
        byte[] randomBytes = new byte[64];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getEncoder().encodeToString(randomBytes);
    }
}
