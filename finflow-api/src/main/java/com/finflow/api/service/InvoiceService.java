package com.finflow.api.service;

import com.finflow.api.dto.TransferRequest;
import com.finflow.api.model.PaymentRequest;
import com.finflow.api.repository.PaymentRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final PaymentRequestRepository requestRepository;
    private final WalletService walletService;
    private final SimpMessagingTemplate messagingTemplate;

    public PaymentRequest createInvoice(String requesterEmail, String targetEmail, BigDecimal amount, String description) {
        if (requesterEmail.equalsIgnoreCase(targetEmail)) {
            throw new IllegalArgumentException("You cannot invoice yourself.");
        }

        PaymentRequest request = PaymentRequest.builder()
                .requesterEmail(requesterEmail)
                .targetEmail(targetEmail)
                .amount(amount)
                .description(description)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        request = requestRepository.save(request);

        try {
            String cleanTargetTopic = "/topic/transfers/" + targetEmail.toLowerCase().trim();
            messagingTemplate.convertAndSend(
                    cleanTargetTopic,
                    Map.of(
                            "type", "INVOICE_RECEIVED",
                            "amount", amount,
                            "sender", requesterEmail,
                            "reference", "INV-" + request.getId()
                    )
            );
        } catch (Exception e) {
            System.err.println("WebSocket broadcast failed for invoice.");
        }

        return request;
    }

    @Transactional
    public void payInvoice(Long invoiceId, String payerEmail) {
        PaymentRequest request = requestRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found."));

        if (!request.getTargetEmail().equalsIgnoreCase(payerEmail)) {
            throw new IllegalArgumentException("Unauthorized to pay this invoice.");
        }
        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalArgumentException("Invoice is not pending.");
        }

        TransferRequest transfer = TransferRequest.builder()
                .receiverEmail(request.getRequesterEmail())
                .amount(request.getAmount())
                .description("Invoice Settlement: " + request.getDescription())
                .build();

        walletService.transferFunds(payerEmail, transfer);

        request.setStatus("PAID");
        requestRepository.save(request);
    }

    public void cancelInvoice(Long invoiceId, String userEmail) {
        PaymentRequest request = requestRepository.findById(invoiceId).orElseThrow();
        if (!request.getTargetEmail().equalsIgnoreCase(userEmail) && !request.getRequesterEmail().equalsIgnoreCase(userEmail)) {
            throw new IllegalArgumentException("Unauthorized access.");
        }
        request.setStatus("CANCELED");
        requestRepository.save(request);
    }

    public List<PaymentRequest> getInbox(String email) {
        return requestRepository.findByTargetEmailOrderByCreatedAtDesc(email);
    }

    public List<PaymentRequest> getOutbox(String email) {
        return requestRepository.findByRequesterEmailOrderByCreatedAtDesc(email);
    }
}