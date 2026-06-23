package com.finflow.api.repository;

import com.finflow.api.model.VirtualCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VirtualCardRepository extends JpaRepository<VirtualCard, Long> {
    List<VirtualCard> findByWalletIdOrderByIssuedAtDesc(Long walletId);
}