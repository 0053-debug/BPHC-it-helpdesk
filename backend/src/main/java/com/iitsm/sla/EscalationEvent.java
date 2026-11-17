package com.iitsm.sla;

import java.time.LocalDateTime;

public record EscalationEvent(Long incidentId,
                              EscalationLevel level,
                              String reason,
                              LocalDateTime escalatedAt) {}
