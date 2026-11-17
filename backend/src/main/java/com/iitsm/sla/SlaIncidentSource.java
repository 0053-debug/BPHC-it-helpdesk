package com.iitsm.sla;

import java.util.List;

public interface SlaIncidentSource {
    List<SlaTrackedIncident> findOpenIncidents();
}
