package com.iitsm.core.state;

import com.iitsm.core.model.Incident;
import com.iitsm.core.model.IncidentStatus;

public class ClassifiedState implements IncidentState {
    @Override
    public void assign(Incident incident) { incident.changeState(new AssignedState()); }
    @Override
    public IncidentStatus getStatus() { return IncidentStatus.CLASSIFIED; }
}