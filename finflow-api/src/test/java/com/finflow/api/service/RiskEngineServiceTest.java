package com.finflow.api.service;

import com.finflow.api.dto.RiskAssessment;
import com.finflow.api.model.Wallet;
import com.finflow.api.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

// Tells JUnit to enable Mockito to create fake objects
@ExtendWith(MockitoExtension.class)
public class RiskEngineServiceTest {

    @Mock
    private TransactionRepository transactionRepository; // Fake Database

    @InjectMocks
    private RiskEngineService riskEngineService; // The real service we are testing

    private Wallet testWallet;

    @BeforeEach
    void setUp() {
        testWallet = new Wallet();
        testWallet.setId(99L);
    }

    @Test
    void evaluateTransaction_ShouldReturnHighRisk_WhenAmountIsOver10000() {
        // ACT (Execute the logic)
        RiskAssessment result = riskEngineService.evaluateTransaction(testWallet, new BigDecimal("15000.00"));

        // ASSERT (Verify the output)
        assertEquals("HIGH", result.getScore(), "Amounts over $10,000 must be HIGH risk");
    }

    @Test
    void evaluateTransaction_ShouldReturnMediumRisk_WhenAmountIsExactly1000() {
        // ACT
        RiskAssessment result = riskEngineService.evaluateTransaction(testWallet, new BigDecimal("1000.00"));

        // ASSERT
        assertEquals("MEDIUM", result.getScore(), "Amounts of exactly $1,000 must trigger MEDIUM risk");
    }

    @Test
    void evaluateTransaction_ShouldReturnLowRisk_WhenAmountIsNormalAndUserHasHistory() {
        // ARRANGE (Tell the fake database how to behave)
        when(transactionRepository.findBySourceWalletIdOrDestinationWalletId(99L, 99L))
                .thenReturn(List.of(new com.finflow.api.model.Transaction()));

        // ACT
        RiskAssessment result = riskEngineService.evaluateTransaction(testWallet, new BigDecimal("50.00"));

        // ASSERT
        assertEquals("LOW", result.getScore(), "Standard small transactions should be LOW risk");
    }
}