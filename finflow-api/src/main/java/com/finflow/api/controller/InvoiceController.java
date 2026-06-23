package com.finflow.api.controller;

import com.finflow.api.model.PaymentRequest;
import com.finflow.api.service.InvoiceService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/create")
    public ResponseEntity<?> createInvoice(@RequestBody InvoiceDto request, Authentication auth) {
        PaymentRequest inv = invoiceService.createInvoice(auth.getName(), request.getTargetEmail(), request.getAmount(), request.getDescription());
        return ResponseEntity.ok(inv);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> payInvoice(@PathVariable Long id, Authentication auth) {
        invoiceService.payInvoice(id, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Invoice settled successfully."));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelInvoice(@PathVariable Long id, Authentication auth) {
        invoiceService.cancelInvoice(id, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Invoice canceled."));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<PaymentRequest>> getInbox(Authentication auth) {
        return ResponseEntity.ok(invoiceService.getInbox(auth.getName()));
    }

    @GetMapping("/outbox")
    public ResponseEntity<List<PaymentRequest>> getOutbox(Authentication auth) {
        return ResponseEntity.ok(invoiceService.getOutbox(auth.getName()));
    }
}

@Data
class InvoiceDto {
    private String targetEmail;
    private BigDecimal amount;
    private String description;
}