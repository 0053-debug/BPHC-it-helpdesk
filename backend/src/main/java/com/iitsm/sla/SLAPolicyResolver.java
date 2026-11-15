package com.iitsm.sla;

import com.iitsm.core.enums.Priority;
import com.iitsm.core.model.SLAPolicy;
import org.springframework.stereotype.Service;

@Service
public class SLAPolicyResolver {

    private final SLAPolicyRepository repository;

    public SLAPolicyResolver(SLAPolicyRepository repository) {
        this.repository = repository;
    }

    public SLAPolicy resolve(Priority priority) {
        return repository.findByPriority(priority)
                .orElseThrow(() -> new SlaNotConfiguredException(
                        "No SLA policy configured for priority " + priority));
    }
}