package com.finflow.api.controller;

import com.finflow.api.dto.DepositRequest;
import com.finflow.api.service.WalletService;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final WalletService walletService;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<?> createPaymentIntent(@Valid @RequestBody DepositRequest request) {
        try {
            long amountInCents = request.getAmount().multiply(new BigDecimal("100")).longValue();

            //THE RBI BYPASS
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("inr") 
                    .addPaymentMethodType("card")
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            return ResponseEntity.ok(Map.of("clientSecret", intent.getClientSecret()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/confirm-deposit")
    public ResponseEntity<?> confirmDeposit(@Valid @RequestBody DepositRequest request, Authentication auth) {
        String receiptId = walletService.depositFunds(auth.getName(), request.getAmount());
        return ResponseEntity.ok(Map.of(
                "message", "Liquidity injected successfully",
                "transactionReference", receiptId
        ));
    }
}