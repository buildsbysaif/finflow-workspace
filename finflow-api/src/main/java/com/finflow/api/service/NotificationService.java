package com.finflow.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final JavaMailSender mailSender;

    @Async
    public void sendDepositReceipt(String toEmail, BigDecimal amount, String receiptId) {
        System.out.println("Starting background thread to send deposit email...");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@finflow.com");
        message.setTo(toEmail);
        message.setSubject("FINFLOW - Deposit Receipt");
        message.setText("Hello,\n\n" +
                "We have successfully processed your deposit.\n\n" +
                "Amount: $" + amount + "\n" +
                "Receipt ID: " + receiptId + "\n\n" +
                "Thank you for using FINFLOW.");

        mailSender.send(message);
        
        System.out.println("Background email successfully sent to " + toEmail);
    }

    @Async
    public void sendTransferReceipt(String toEmail, String receiverEmail, BigDecimal amount, String receiptId) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@finflow.com");
        message.setTo(toEmail);
        message.setSubject("FINFLOW - Transfer Sent");
        message.setText("Hello,\n\n" +
                "Your transfer was successful.\n\n" +
                "Sent to: " + receiverEmail + "\n" +
                "Amount: $" + amount + "\n" +
                "Receipt ID: " + receiptId + "\n\n" +
                "Thank you for using FINFLOW.");

        mailSender.send(message);
    }
}