package com.finflow.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequest {

    @NotBlank(message = "Recipient email is strictly required.")
    @Email(message = "Malformed recipient email address.")
    private String receiverEmail;

    @NotNull(message = "Transfer amount cannot be null.")
    @DecimalMin(value = "0.01", message = "Minimum dispatch velocity is $0.01")
    private BigDecimal amount;

    private String description;
}