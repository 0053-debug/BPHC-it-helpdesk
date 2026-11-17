package com.iitsm.priority;

import com.iitsm.core.enums.Impact;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.enums.Urgency;
import org.springframework.stereotype.Service;

@Service
public class PriorityService {

    private final PriorityStrategy strategy;

    public PriorityService(PriorityStrategy strategy) {
        this.strategy = strategy;
    }

    public Priority determine(Impact impact, Urgency urgency, int businessCriticality) {
        return strategy.calculate(impact, urgency, businessCriticality);
    }
}

