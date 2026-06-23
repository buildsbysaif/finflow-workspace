package com.finflow.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reconciliation_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReconciliationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime executionTime;
    
    private int totalWalletsChecked;
    
    private int discrepanciesFound;
    
    private String status; 
    
    @Column(columnDefinition = "TEXT")
    private String details;
}