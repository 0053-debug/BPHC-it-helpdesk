package com.iitsm.sla;

import com.iitsm.core.model.SLAPolicy;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/sla")
public class SlaController {

    public record PolicyResponse(Long id,
                                 String priority,
                                 int responseTargetMinutes,
                                 int resolutionTargetMinutes) {}

    private final SLAPolicyRepository policies;
    private final SlaViolationRepository violations;
    private final EscalationRecordRepository escalations;

    public SlaController(SLAPolicyRepository policies,
                         SlaViolationRepository violations,
                         EscalationRecordRepository escalations) {
        this.policies = policies;
        this.violations = violations;
        this.escalations = escalations;
    }

    @GetMapping("/policies")
    public List<PolicyResponse> listPolicies() {
        return policies.findAll().stream()
                .sorted(Comparator.comparing(SLAPolicy::getPriority))
                .map(p -> new PolicyResponse(p.getId(), p.getPriority().name(),
                        p.getResponseTargetMinutes(), p.getResolutionTargetMinutes()))
                .toList();
    }

    @GetMapping("/violations")
    public List<SlaViolation> listViolations() {
        return violations.findAllByOrderByRecordedAtDesc();
    }

    @GetMapping("/escalations/{incidentId}")
    public List<EscalationRecord> listEscalations(@PathVariable Long incidentId) {
        return escalations.findByIncidentIdOrderByEscalatedAtAsc(incidentId);
    }
}