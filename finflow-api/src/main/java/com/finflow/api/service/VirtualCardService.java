package com.finflow.api.service;

import com.finflow.api.model.User;
import com.finflow.api.model.VirtualCard;
import com.finflow.api.model.Wallet;
import com.finflow.api.repository.UserRepository;
import com.finflow.api.repository.VirtualCardRepository;
import com.finflow.api.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class VirtualCardService {

    private final VirtualCardRepository virtualCardRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    @Transactional
    public VirtualCard issueNewCard(String email, String cardholderName, BigDecimal limit) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        //Cryptographic Generation: Generate a 16-digit Visa Number (Starts with 4)
        Random rand = new Random();
        StringBuilder numBuilder = new StringBuilder("4111"); 
        for (int i = 0; i < 12; i++) {
            numBuilder.append(rand.nextInt(10));
        }
        String formattedCardNumber = numBuilder.toString().replaceAll(".{4}", "$0 ").trim();

        //Generate Expiry (3 Years from today)
        LocalDate expiry = LocalDate.now().plusYears(3);
        String formattedExpiry = expiry.format(DateTimeFormatter.ofPattern("MM/yy"));

        //Generate CVV
        String generatedCvv = String.format("%03d", rand.nextInt(1000));

        //Construct and Save Entity
        VirtualCard newCard = VirtualCard.builder()
                .cardNumber(formattedCardNumber)
                .cardholderName(cardholderName.toUpperCase())
                .expiryDate(formattedExpiry)
                .cvv(generatedCvv)
                .status("ACTIVE")
                .spendingLimit(limit)
                .issuedAt(LocalDateTime.now())
                .wallet(wallet)
                .build();

        return virtualCardRepository.save(newCard);
    }

    public List<VirtualCard> getMyCards(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Wallet wallet = walletRepository.findByUserId(user.getId()).orElseThrow();
        return virtualCardRepository.findByWalletIdOrderByIssuedAtDesc(wallet.getId());
    }
}