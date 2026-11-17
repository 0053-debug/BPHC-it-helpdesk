package com.iitsm.core.state;

import com.iitsm.core.model.Incident;
import com.iitsm.core.model.IncidentStatus;

public class NewState implements IncidentState {
    @Override
    public void classify(Incident incident) { incident.changeState(new ClassifiedState()); }
    @Override
    public IncidentStatus getStatus() { return IncidentStatus.NEW; }
}