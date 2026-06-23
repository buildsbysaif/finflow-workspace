package com.finflow.api.service;

import com.finflow.api.model.ReconciliationLog;
import com.finflow.api.model.Transaction;
import com.finflow.api.model.Wallet;
import com.finflow.api.repository.ReconciliationLogRepository;
import com.finflow.api.repository.TransactionRepository;
import com.finflow.api.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReconciliationService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final ReconciliationLogRepository reconciliationLogRepository;

    /**
     * Automated Audit Worker
     * Cron configuration expression format: [second] [minute] [hour] [day of month] [month] [day of week]

     */
    @Scheduled(cron = "0 */2 * * * ?")
    public void runAutomatedLedgerReconciliation() {
        System.out.println(">>> [CRON WORKER] Starting scheduled ledger integrity audit at " + LocalDateTime.now());
        
        List<Wallet> allWallets = walletRepository.findAll();
        int discrepancies = 0;
        StringBuilder reportDetails = new StringBuilder();

        for (Wallet wallet : allWallets) {
            BigDecimal computedBalance = BigDecimal.ZERO;

            //Fetch all transactions associated with this wallet
            List<Transaction> transactions = transactionRepository.findAll(); 

            for (Transaction tx : transactions) {
                if (!"SUCCESS".equalsIgnoreCase(tx.getStatus())) {
                    continue; // Skip failed payments
                }

                if (tx.getDestinationWallet() != null && tx.getDestinationWallet().getId().equals(wallet.getId())) {
                    computedBalance = computedBalance.add(tx.getAmount());
                }
                
                if (tx.getSourceWallet() != null && tx.getSourceWallet().getId().equals(wallet.getId())) {
                    computedBalance = computedBalance.subtract(tx.getAmount());
                }
            }

            //Compare computed balance against stored DB column balance
            if (computedBalance.compareTo(wallet.getBalance()) != 0) {
                discrepancies++;
                reportDetails.append(String.format("Wallet ID %d (User ID %d) failed matching check. Stored: $%s, Ledger Summed: $%s. \n",
                        wallet.getId(), wallet.getUser().getId(), wallet.getBalance(), computedBalance));
            }
        }

        if (discrepancies == 0) {
            reportDetails.append("All database balances perfectly reconciled with immutable transaction ledgers.");
        }

        //Save audit log trail to database
        ReconciliationLog log = ReconciliationLog.builder()
                .executionTime(LocalDateTime.now())
                .totalWalletsChecked(allWallets.size())
                .discrepanciesFound(discrepancies)
                .status(discrepancies == 0 ? "SUCCESS" : "ALERT")
                .details(reportDetails.toString())
                .build();

        reconciliationLogRepository.save(log);
        System.out.println(">>> [CRON WORKER] Audit finished. Discrepancies found: " + discrepancies);
    }
}