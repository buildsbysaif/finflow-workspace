package com.finflow.api.repository;

import com.finflow.api.model.PaymentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, Long> {
    List<PaymentRequest> findByTargetEmailOrderByCreatedAtDesc(String targetEmail);
    
    List<PaymentRequest> findByRequesterEmailOrderByCreatedAtDesc(String requesterEmail);
}