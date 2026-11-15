package com.bphc.itsm.sla;

import com.bphc.itsm.priority.Priority;

public class SLAPolicy {

    private final Priority priority;
    private final int responseMinutes;
    private final int resolutionMinutes;

    public SLAPolicy(Priority priority, int responseMinutes, int resolutionMinutes) {
        if (responseMinutes <= 0 || resolutionMinutes <= 0) {
            throw new IllegalArgumentException("SLA targets must be positive");
        }
        this.priority = priority;
        this.responseMinutes = responseMinutes;
        this.resolutionMinutes = resolutionMinutes;
    }

    public Priority getPriority() { return priority; }
    public int getResponseMinutes() { return responseMinutes; }
    public int getResolutionMinutes() { return resolutionMinutes; }
}
