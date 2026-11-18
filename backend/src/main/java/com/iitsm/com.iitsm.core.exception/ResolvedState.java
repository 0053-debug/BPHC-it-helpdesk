package com.iitsm.core.state;

import com.iitsm.core.model.Incident;
import com.iitsm.core.model.IncidentStatus;

public class ResolvedState implements IncidentState {
    @Override
    public void verify(Incident incident) { incident.changeState(new VerifiedState()); }
    @Override
    public IncidentStatus getStatus() { return IncidentStatus.RESOLVED; }
}