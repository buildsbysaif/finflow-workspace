package com.finflow.api.service;

import com.finflow.api.model.Transaction;
import com.finflow.api.model.User;
import com.finflow.api.model.Wallet;
import com.finflow.api.repository.TransactionRepository;
import com.finflow.api.repository.UserRepository;
import com.finflow.api.repository.WalletRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatementService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public byte[] generateStatement(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        // Safely fetch all transactions belonging to this specific wallet
        List<Transaction> transactions = transactionRepository.findAll().stream()
                .filter(t -> (t.getSourceWallet() != null && t.getSourceWallet().getId().equals(wallet.getId())) ||
                             (t.getDestinationWallet() != null && t.getDestinationWallet().getId().equals(wallet.getId())))
                .toList();

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // Document Header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.DARK_GRAY);
            Paragraph title = new Paragraph("FINFLOW INSTITUTIONAL STATEMENT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // Account Details
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);
            document.add(new Paragraph("Account Holder: " + user.getEmail(), normalFont));
            document.add(new Paragraph("Available Liquidity: $" + wallet.getBalance(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.BLACK)));
            document.add(new Paragraph("Statement Date: " + java.time.LocalDate.now().toString(), normalFont));
            document.add(Chunk.NEWLINE);

            // Ledger Table Setup
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 2f, 4f, 2f});

            // Table Headers
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"Reference ID", "Type", "Description", "Amount"};
            for (String header : headers) {
                PdfPCell hCell = new PdfPCell(new Phrase(header, headFont));
                hCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                hCell.setBackgroundColor(Color.DARK_GRAY);
                hCell.setPadding(6);
                table.addCell(hCell);
            }

            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            for (Transaction t : transactions) {
                table.addCell(new PdfPCell(new Phrase(t.getTransactionReference(), cellFont)));
                table.addCell(new PdfPCell(new Phrase(t.getType(), cellFont)));
                table.addCell(new PdfPCell(new Phrase(t.getDescription(), cellFont)));
                
                // Format Amount
                String amountStr = "$" + t.getAmount().toString();
                if (t.getSourceWallet() != null && t.getSourceWallet().getId().equals(wallet.getId())) {
                    amountStr = "-$" + t.getAmount().toString(); // Outbound
                } else {
                    amountStr = "+$" + t.getAmount().toString(); // Inbound
                }
                PdfPCell amtCell = new PdfPCell(new Phrase(amountStr, cellFont));
                amtCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(amtCell);
            }

            document.add(table);
            document.close();
            
        } catch (DocumentException e) {
            throw new RuntimeException("Error compiling PDF Statement", e);
        }

        return out.toByteArray(); // Return as raw binary data
    }
}