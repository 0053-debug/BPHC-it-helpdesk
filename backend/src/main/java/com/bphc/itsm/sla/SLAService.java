package com.bphc.itsm.sla;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class SLAService {

    public LocalDateTime responseDeadline(LocalDateTime createdAt, SLAPolicy policy) {
        return createdAt.plusMinutes(policy.getResponseMinutes());
    }

    public LocalDateTime resolutionDeadline(LocalDateTime createdAt, SLAPolicy policy) {
        return createdAt.plusMinutes(policy.getResolutionMinutes());
    }

    // resolvedAt can be null if the incident is still open
    public boolean isResolutionViolated(LocalDateTime createdAt, LocalDateTime resolvedAt,
                                        LocalDateTime now, SLAPolicy policy) {
        LocalDateTime end = (resolvedAt != null) ? resolvedAt : now;
        return end.isAfter(resolutionDeadline(createdAt, policy));
    }
}
