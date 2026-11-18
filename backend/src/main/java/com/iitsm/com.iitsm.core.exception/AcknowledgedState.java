package com.iitsm.core.state;

import com.iitsm.core.model.Incident;
import com.iitsm.core.model.IncidentStatus;

public class AcknowledgedState implements IncidentState {
    @Override
    public void startInvestigation(Incident incident) { incident.changeState(new InProgressState()); }
    @Override
    public IncidentStatus getStatus() { return IncidentStatus.ACKNOWLEDGED; }
}