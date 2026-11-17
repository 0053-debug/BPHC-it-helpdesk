package com.iitsm.core.state;

import com.iitsm.core.model.Incident;
import com.iitsm.core.model.IncidentStatus;
import java.time.LocalDateTime;

public class AssignedState implements IncidentState {
    @Override
    public void acknowledge(Incident incident) {
        incident.setAcknowledgedAt(LocalDateTime.now()); // Required for Person 3's Response SLA
        incident.changeState(new AcknowledgedState());
    }
    @Override
    public IncidentStatus getStatus() { return IncidentStatus.ASSIGNED; }
}