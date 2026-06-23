package com.finflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionHistoryDTO {
    private String receiptId;
    private String type;
    private String counterpart;
    private BigDecimal amount;
    private String description;
    
    private String riskScore;
    private String riskReason;
    
    private LocalDateTime timestamp;
    private String status;
}