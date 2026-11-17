package com.iitsm.core.state;

import com.iitsm.core.model.Incident;
import com.iitsm.core.model.IncidentStatus;

public class ClosedState implements IncidentState {
    @Override
    public IncidentStatus getStatus() { return IncidentStatus.CLOSED; }
}