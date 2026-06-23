package com.finflow.api.service;

import com.finflow.api.dto.TransactionHistoryDTO;
import com.finflow.api.model.Transaction;
import com.finflow.api.model.User;
import com.finflow.api.model.Wallet;
import com.finflow.api.repository.TransactionRepository;
import com.finflow.api.repository.UserRepository;
import com.finflow.api.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    public List<TransactionHistoryDTO> getUserTransactionHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Wallet userWallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        List<Transaction> transactions = transactionRepository
                .findBySourceWalletIdOrDestinationWalletId(userWallet.getId(), userWallet.getId());

        return transactions.stream().map(tx -> {
            
            String counterpart = "SYSTEM";
            if (tx.getSourceWallet() != null && tx.getDestinationWallet() != null) {
                if (tx.getSourceWallet().getId().equals(userWallet.getId())) {
                    counterpart = tx.getDestinationWallet().getUser().getEmail(); 
                } else {
                    counterpart = tx.getSourceWallet().getUser().getEmail(); 
                }
            }

            return TransactionHistoryDTO.builder()
                    .receiptId(tx.getTransactionReference())
                    .type(tx.getType())
                    .counterpart(counterpart)
                    .amount(tx.getAmount())
                    .description(tx.getDescription())
                    .riskScore(tx.getRiskScore())  
                    .riskReason(tx.getRiskReason()) 
                    .timestamp(tx.getTimestamp())
                    .status(tx.getStatus())
                    .build();
        }).collect(Collectors.toList());
    }
}