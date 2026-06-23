package com.finflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RiskAssessment {
    private String score;  // e.g., "LOW", "MEDIUM", "HIGH"
    private String reason; // e.g., "Amount exceeds AML threshold"
}