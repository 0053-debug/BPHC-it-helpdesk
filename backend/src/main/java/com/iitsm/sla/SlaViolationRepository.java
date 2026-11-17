package com.iitsm.sla;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SlaViolationRepository extends JpaRepository<SlaViolation, Long> {

    boolean existsByIncidentIdAndViolationType(Long incidentId, ViolationType violationType);

    List<SlaViolation> findAllByOrderByRecordedAtDesc();
}
