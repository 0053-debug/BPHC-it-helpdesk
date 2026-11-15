package com.iitsm.audit.repository;

import com.iitsm.audit.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    List<AuditLog> findByIncidentIdOrderByTimestampAsc(Long incidentId);

    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
