package com.iitsm.sla;

import java.time.LocalDateTime;

public record SlaAlertEvent(Long incidentId,
                            ViolationType type,
                            AlertKind kind,
                            LocalDateTime deadline) {}
