package com.iitsm.incident.service;

import com.iitsm.core.enums.IncidentStatus;
import com.iitsm.core.exception.InvalidStateTransitionException;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class IncidentLifecycle {
    private static final Map<IncidentStatus, IncidentStatus> NEXT = Map.of(
            IncidentStatus.NEW, IncidentStatus.CLASSIFIED,
            IncidentStatus.CLASSIFIED, IncidentStatus.ASSIGNED,
            IncidentStatus.ASSIGNED, IncidentStatus.ACKNOWLEDGED,
            IncidentStatus.ACKNOWLEDGED, IncidentStatus.IN_PROGRESS,
            IncidentStatus.IN_PROGRESS, IncidentStatus.RESOLVED,
            IncidentStatus.RESOLVED, IncidentStatus.VERIFIED,
            IncidentStatus.VERIFIED, IncidentStatus.CLOSED);

    public void transition(String current, String target) {
        IncidentStatus from;
        IncidentStatus to;
        try { from = IncidentStatus.valueOf(current); to = IncidentStatus.valueOf(target); }
        catch (RuntimeException invalid) { throw new InvalidStateTransitionException(current, target); }
        if (NEXT.get(from) != to) throw new InvalidStateTransitionException(current, target);
    }
}
