package org.example.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final Logger logger = LoggerFactory.getLogger(LoginAttemptService.class);

    static final int MAX_ATTEMPTS = 5;
    static final long LOCK_DURATION_MINUTES = 15;

    private final ConcurrentHashMap<String, AttemptInfo> attemptsCache = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        attemptsCache.remove(key);
    }

    public void loginFailed(String key) {
        AttemptInfo info = attemptsCache.computeIfAbsent(key, k -> new AttemptInfo());
        info.increment();
        logger.warn("Failed login attempt #{} for key: {}", info.getAttempts(), key);
    }

    public boolean isBlocked(String key) {
        AttemptInfo info = attemptsCache.get(key);
        if (info == null || info.getAttempts() < MAX_ATTEMPTS) {
            return false;
        }
        if (LocalDateTime.now().isAfter(info.getLastAttemptTime().plusMinutes(LOCK_DURATION_MINUTES))) {
            attemptsCache.remove(key);
            return false;
        }
        return true;
    }

    static class AttemptInfo {
        private int attempts = 0;
        private LocalDateTime lastAttemptTime = LocalDateTime.now();

        void increment() {
            attempts++;
            lastAttemptTime = LocalDateTime.now();
        }

        int getAttempts() { return attempts; }
        LocalDateTime getLastAttemptTime() { return lastAttemptTime; }
    }
}
