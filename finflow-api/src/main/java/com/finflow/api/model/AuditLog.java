package com.finflow.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String username; 

    @Column(nullable = false, length = 255)
    private String endpoint; 

    @Column(nullable = false, length = 50)
    private String method; 

    @Column(nullable = false)
    private String status; 

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private long executionTimeMs;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}