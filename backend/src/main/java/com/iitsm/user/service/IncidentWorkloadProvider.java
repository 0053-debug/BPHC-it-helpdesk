package com.iitsm.user.service;

import java.util.Collection;
import java.util.Map;

public interface IncidentWorkloadProvider {
    Map<Long, Integer> getActiveWorkloads(Collection<Long> technicianIds);
}
