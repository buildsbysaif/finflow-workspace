package com.finflow.api.service;

import com.finflow.api.dto.RiskAssessment;
import com.finflow.api.dto.TransferRequest;
import com.finflow.api.model.Transaction;
import com.finflow.api.model.User;
import com.finflow.api.model.Wallet;
import com.finflow.api.repository.TransactionRepository;
import com.finflow.api.repository.UserRepository;
import com.finflow.api.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {

        private final WalletRepository walletRepository;
        private final UserRepository userRepository;
        private final TransactionRepository transactionRepository;

        private final RiskEngineService riskEngineService;

        private final NotificationService notificationService;
        private final SimpMessagingTemplate messagingTemplate;

        // Fetch the wallet for the logged-in user
        public Wallet getMyWallet(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                return walletRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));
        }

        @Transactional(isolation = Isolation.READ_COMMITTED)
        public String transferFunds(String senderEmail, TransferRequest request) {

                if (senderEmail.equalsIgnoreCase(request.getReceiverEmail())) {
                        throw new IllegalArgumentException("You cannot transfer funds to your own wallet.");
                }

                User senderUser = userRepository.findByEmail(senderEmail)
                                .orElseThrow(() -> new IllegalArgumentException("Sender not found."));
                Wallet senderWallet = walletRepository.findByUserId(senderUser.getId())
                                .orElseThrow(() -> new IllegalArgumentException("Sender wallet not found."));

                User receiverUser = userRepository.findByEmail(request.getReceiverEmail())
                                .orElseThrow(() -> new IllegalArgumentException("Receiver not found."));
                Wallet receiverWallet = walletRepository.findByUserId(receiverUser.getId())
                                .orElseThrow(() -> new IllegalArgumentException("Receiver wallet not found."));

                if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
                        throw new IllegalArgumentException("Insufficient funds.");
                }

                //CALL THE RISK ENGINE BEFORE MOVING MONEY
                RiskAssessment risk = riskEngineService.evaluateTransaction(senderWallet, request.getAmount());

                senderWallet.setBalance(senderWallet.getBalance().subtract(request.getAmount()));
                receiverWallet.setBalance(receiverWallet.getBalance().add(request.getAmount()));

                walletRepository.save(senderWallet);
                walletRepository.save(receiverWallet);

                //Include the risk data in the ledger receipt
                Transaction transaction = Transaction.builder()
                                .transactionReference(UUID.randomUUID().toString())
                                .sourceWallet(senderWallet)
                                .destinationWallet(receiverWallet)
                                .amount(request.getAmount())
                                .type("P2P_TRANSFER")
                                .status("SUCCESS")
                                .description(request.getDescription())
                                .riskScore(risk.getScore()) 
                                .riskReason(risk.getReason()) 
                                .build();

                transactionRepository.save(transaction);

                //TRIGGER BACKGROUND EMAIL
                notificationService.sendTransferReceipt(senderEmail, request.getReceiverEmail(), request.getAmount(),
                                transaction.getTransactionReference());

                //STRICT LOWERCASE WEBSOCKET ALERT
                try {
                        String cleanTargetTopic = "/topic/transfers/" + request.getReceiverEmail().toLowerCase().trim();
                        messagingTemplate.convertAndSend(
                                        cleanTargetTopic,
                                        Map.of(
                                                        "type", "INCOMING_TRANSFER",
                                                        "amount", request.getAmount(),
                                                        "sender", senderEmail,
                                                        "reference", transaction.getTransactionReference()));
                } catch (Exception e) {
                        System.err.println("WebSocket broadcast failed: " + e.getMessage());
                }

                return transaction.getTransactionReference();
        }

        //STRIPE DEPOSIT LOGIC
        @Transactional(isolation = Isolation.READ_COMMITTED)
        public String depositFunds(String email, BigDecimal amount) {
                if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException("Deposit amount must be strictly positive.");
                }

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException("User not found."));
                Wallet wallet = walletRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new IllegalArgumentException("Wallet not found."));

                wallet.setBalance(wallet.getBalance().add(amount));
                walletRepository.save(wallet);

                Transaction transaction = Transaction.builder()
                                .transactionReference(
                                                "DEP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                .sourceWallet(null) // Null implies external source (Stripe)
                                .destinationWallet(wallet)
                                .amount(amount)
                                .type("DEPOSIT")
                                .status("SUCCESS")
                                .description("Stripe External Funding")
                                .riskScore("LOW") // Deposits from Stripe are pre-cleared by the gateway
                                .riskReason("Verified Gateway Origin")
                                .build();

                transactionRepository.save(transaction);
                return transaction.getTransactionReference();
        }

}