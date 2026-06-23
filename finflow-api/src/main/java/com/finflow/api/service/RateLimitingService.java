package com.finflow.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RateLimitingService {

    private final StringRedisTemplate redisTemplate;

    public boolean isAllowed(String ipAddress) {
        String redisKey = "rate_limit:login:" + ipAddress;
        Long requests = redisTemplate.opsForValue().increment(redisKey);
        if (requests != null && requests == 1) {
            redisTemplate.expire(redisKey, Duration.ofMinutes(1));
        }
        return requests != null && requests <= 5;
    }
}