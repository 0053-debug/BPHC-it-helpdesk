package com.iitsm.core.state;

import com.iitsm.core.model.Incident;
import com.iitsm.core.model.IncidentStatus;

public class VerifiedState implements IncidentState {
    @Override
    public void close(Incident incident) { incident.changeState(new ClosedState()); }
    @Override
    public IncidentStatus getStatus() { return IncidentStatus.VERIFIED; }
}