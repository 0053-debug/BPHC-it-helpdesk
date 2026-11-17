package com.iitsm.core.state;

import com.iitsm.core.model.Incident;
import com.iitsm.core.model.IncidentStatus;
import java.time.LocalDateTime;

public class InProgressState implements IncidentState {
    @Override
    public void resolve(Incident incident, String resolutionNotes) {
        if (resolutionNotes == null || resolutionNotes.trim().isEmpty()) {
            throw new IllegalArgumentException("Resolution notes are required to resolve an incident.");
        }
        incident.setResolutionNotes(resolutionNotes);
        incident.setResolvedAt(LocalDateTime.now()); // Required for Person 3's Resolution SLA[cite: 48]
        incident.changeState(new ResolvedState());
    }
    @Override
    public IncidentStatus getStatus() { return IncidentStatus.IN_PROGRESS; }
}