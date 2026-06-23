package com.finflow.api.service;

import com.finflow.api.dto.TransferRequest;
import com.finflow.api.model.User;
import com.finflow.api.model.Wallet;
import com.finflow.api.repository.TransactionRepository;
import com.finflow.api.repository.UserRepository;
import com.finflow.api.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class WalletServiceTest {

    @Mock private WalletRepository walletRepository;
    @Mock private UserRepository userRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private RiskEngineService riskEngineService;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private WalletService walletService;

    @Test
    void transferFunds_ShouldThrowException_WhenSenderHasInsufficientFunds() {
        //ARRANGE (Set up the fake scenario)
        String senderEmail = "poor@user.com";
        TransferRequest request = new TransferRequest("rich@user.com", new BigDecimal("500.00"), "Trying to send $500");

        User fakeSenderUser = new User(); fakeSenderUser.setId(1L);
        Wallet fakeSenderWallet = new Wallet(); 
        fakeSenderWallet.setBalance(new BigDecimal("10.00")); 

        User fakeReceiverUser = new User(); fakeReceiverUser.setId(2L);
        Wallet fakeReceiverWallet = new Wallet();

        when(userRepository.findByEmail(senderEmail)).thenReturn(Optional.of(fakeSenderUser));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(fakeSenderWallet));
        when(userRepository.findByEmail(request.getReceiverEmail())).thenReturn(Optional.of(fakeReceiverUser));
        when(walletRepository.findByUserId(2L)).thenReturn(Optional.of(fakeReceiverWallet));

        //ACT & ASSERT
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            walletService.transferFunds(senderEmail, request);
        });

        assertEquals("Insufficient funds.", exception.getMessage());
    }

    @Test
    void transferFunds_ShouldThrowException_WhenSendingToSelf() {
        // ARRANGE
        TransferRequest request = new TransferRequest("myself@user.com", new BigDecimal("100.00"), "Self transfer");

        // ACT & ASSERT
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            walletService.transferFunds("myself@user.com", request);
        });

        assertEquals("You cannot transfer funds to your own wallet.", exception.getMessage());
    }
}