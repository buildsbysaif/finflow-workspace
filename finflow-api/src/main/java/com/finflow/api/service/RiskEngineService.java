package com.finflow.api.service;

import com.finflow.api.dto.RiskAssessment;
import com.finflow.api.model.Wallet;
import com.finflow.api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class RiskEngineService {

    private final TransactionRepository transactionRepository;

    public RiskAssessment evaluateTransaction(Wallet senderWallet, BigDecimal amount) {
        
        //Anti-Money Laundering (AML) Hard Threshold
        // Any transfer over $10,000 triggers an automatic HIGH risk flag
        if (amount.compareTo(new BigDecimal("10000")) >= 0) {
            return new RiskAssessment("HIGH", "Transaction exceeds $10,000 AML compliance threshold.");
        }

        //Suspiciously Large Standard Transfer
        if (amount.compareTo(new BigDecimal("1000")) >= 0) {
            return new RiskAssessment("MEDIUM", "Transaction exceeds $1,000 standard threshold.");
        }

        //New User / Cold Wallet Check
        // If the user has never made a transaction before, flag their first movement as MEDIUM
        int previousTxCount = transactionRepository
                .findBySourceWalletIdOrDestinationWalletId(senderWallet.getId(), senderWallet.getId())
                .size();
                
        if (previousTxCount == 0) {
            return new RiskAssessment("MEDIUM", "First transaction detected for this wallet.");
        }

        // Default Fallback
        return new RiskAssessment("LOW", "Standard behavioral pattern.");
    }
}