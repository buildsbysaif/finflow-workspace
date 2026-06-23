package com.finflow.api.controller;

import com.finflow.api.dto.TransactionHistoryDTO;
import com.finflow.api.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/history")
    public ResponseEntity<List<TransactionHistoryDTO>> getHistory(Authentication authentication) {
        String email = authentication.getName();
        List<TransactionHistoryDTO> history = transactionService.getUserTransactionHistory(email);
        return ResponseEntity.ok(history);
    }
}