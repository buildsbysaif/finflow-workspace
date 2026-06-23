package com.finflow.api.controller;

import com.finflow.api.dto.TransferRequest;
import com.finflow.api.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.finflow.api.model.Wallet;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.finflow.api.service.StatementService;

import java.util.Map;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final StatementService statementService; 

    @GetMapping("/my-wallet")
    public ResponseEntity<?> getMyWallet(Authentication authentication) {
        String email = authentication.getName();
        Wallet wallet = walletService.getMyWallet(email);

        return ResponseEntity.ok(Map.of(
                "balance", wallet.getBalance(),
                "currency", wallet.getCurrency()
        ));
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(
            @Valid @RequestBody TransferRequest request,
            Authentication authentication 
    ) {
        String senderEmail = authentication.getName();
        
        String receiptId = walletService.transferFunds(senderEmail, request);
        
        return ResponseEntity.ok(Map.of(
                "message", "Transfer successful.",
                "transactionReference", receiptId
        ));
    }
    
    @GetMapping("/statement")
    public ResponseEntity<byte[]> downloadStatement(Authentication authentication) {
        String email = authentication.getName();
        byte[] pdfBytes = statementService.generateStatement(email);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "FINFLOW_Statement.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}