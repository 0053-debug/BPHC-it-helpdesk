package com.iitsm.sla;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EmptySlaIncidentSource implements SlaIncidentSource {

    @Override
    public List<SlaTrackedIncident> findOpenIncidents() {
        return List.of();
    }
}
