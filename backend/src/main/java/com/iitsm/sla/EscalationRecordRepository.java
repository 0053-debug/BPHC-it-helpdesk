package com.iitsm.sla;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EscalationRecordRepository extends JpaRepository<EscalationRecord, Long> {

    Optional<EscalationRecord> findTopByIncidentIdOrderByEscalatedAtDesc(Long incidentId);

    List<EscalationRecord> findByIncidentIdOrderByEscalatedAtAsc(Long incidentId);

    boolean existsByIncidentIdAndLevel(Long incidentId, EscalationLevel level);
}
