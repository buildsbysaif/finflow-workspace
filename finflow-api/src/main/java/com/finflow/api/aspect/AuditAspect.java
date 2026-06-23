package com.finflow.api.aspect;

import com.finflow.api.model.AuditLog;
import com.finflow.api.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;

    @Around("execution(* com.finflow.api.controller..*(..))")
    public Object logApiActivity(ProceedingJoinPoint joinPoint) throws Throwable {
        
        long startTime = System.currentTimeMillis();
        String status = "SUCCESS";
        Object result = null;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Throwable ex) {
            status = "FAILED: " + ex.getClass().getSimpleName();
            throw ex;
        } finally {
            long executionTime = System.currentTimeMillis() - startTime;
            saveAuditLog(status, executionTime);
        }
    }

    private void saveAuditLog(String status, long executionTime) {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String username = "ANONYMOUS";

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
                username = authentication.getName();
            }

            AuditLog log = AuditLog.builder()
                    .username(username)
                    .endpoint(request.getRequestURI())
                    .method(request.getMethod())
                    .status(status)
                    .executionTimeMs(executionTime)
                    .build();

            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Failed to save audit log: " + e.getMessage());
        }
    }
}