package com.iitsm.priority;

import com.iitsm.core.enums.Impact;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.enums.Urgency;
import org.springframework.stereotype.Component;

@Component
public class WeightedScorePriorityStrategy implements PriorityStrategy {

    @Override
    public Priority calculate(Impact impact, Urgency urgency, int businessCriticality) {
        if (impact == null || urgency == null) {
            throw new IllegalArgumentException("Impact and urgency are required");
        }
        if (businessCriticality < 1 || businessCriticality > 5) {
            throw new IllegalArgumentException("Business criticality must be 1-5");
        }
        int score = (impact.ordinal() + 1) * (urgency.ordinal() + 1) * businessCriticality;
        if (score >= 40) return Priority.P1_CRITICAL;
        if (score >= 20) return Priority.P2_HIGH;
        if (score >= 8)  return Priority.P3_MEDIUM;
        return Priority.P4_LOW;
    }
}
