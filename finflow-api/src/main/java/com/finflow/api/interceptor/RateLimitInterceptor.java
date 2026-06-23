package com.finflow.api.interceptor;

import com.finflow.api.exception.RateLimitExceededException;
import com.finflow.api.service.RateLimitingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitingService rateLimitingService;

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        
        // Extract the user's IP Address
        String clientIp = request.getRemoteAddr();

        // Check the Redis cache
        if (!rateLimitingService.isAllowed(clientIp)) {

            throw new RateLimitExceededException("Too many login attempts. Please try again in 1 minute.");
        }
        
        return true;
    }
}