package com.bphc.itsm.priority;

import org.springframework.stereotype.Service;

@Service
public class PriorityService {

    private final PriorityStrategy strategy;

    public PriorityService(PriorityStrategy strategy) {
        this.strategy = strategy;
    }

    public Priority determine(int impact, int urgency, int businessCriticality) {
        return strategy.calculate(impact, urgency, businessCriticality);
    }
}
