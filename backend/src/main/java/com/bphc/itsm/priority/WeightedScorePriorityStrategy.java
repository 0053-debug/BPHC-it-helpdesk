package com.bphc.itsm.priority;

import org.springframework.stereotype.Component;

@Component
public class WeightedScorePriorityStrategy implements PriorityStrategy {

    @Override
    public Priority calculate(int impact, int urgency, int businessCriticality){
        if (impact < 1 || impact > 3 || urgency < 1 || urgency > 3
                || businessCriticality < 1 || businessCriticality > 5) {
            throw new IllegalArgumentException(
                    "Impact and urgency must be 1-3, criticality must be 1-5");
        }
        int score = impact * urgency * businessCriticality;
        if (score >= 36) return Priority.P1;
        if (score >= 18) return Priority.P2;
        if (score >= 6)  return Priority.P3;
        return Priority.P4;
    }
}
