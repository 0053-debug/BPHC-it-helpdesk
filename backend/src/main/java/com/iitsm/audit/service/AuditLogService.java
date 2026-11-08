package com.iitsm.audit.service;

import com.iitsm.audit.model.AuditLog;
import com.iitsm.audit.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public AuditLog record(AuditLog auditLog) {
        log.debug("Recording audit log for incident: {}, action: {}", auditLog.getIncidentId(), auditLog.getAction());
        return auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditTrailForIncident(Long incidentId) {
        return auditLogRepository.findByIncidentIdOrderByTimestampAsc(incidentId);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Long incidentId, Long actorId, String action, Instant startDate, Instant endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (incidentId != null) {
                predicates.add(cb.equal(root.get("incidentId"), incidentId));
            }
            if (actorId != null) {
                predicates.add(cb.equal(root.get("actorId"), actorId));
            }
            if (action != null && !action.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("action")), "%" + action.toLowerCase() + "%"));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), endDate));
            }
            query.orderBy(cb.desc(root.get("timestamp")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return auditLogRepository.findAll(spec, pageable);
    }
}
