package com.finflow.api.repository;

import com.finflow.api.model.ReconciliationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReconciliationLogRepository extends JpaRepository<ReconciliationLog, Long> {
}