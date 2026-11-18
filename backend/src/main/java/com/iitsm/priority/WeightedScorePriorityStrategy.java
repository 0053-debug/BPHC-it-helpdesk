package com.iitsm.priority;

import com.iitsm.core.enums.Impact;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.enums.Urgency;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class WeightedScorePriorityStrategy implements PriorityStrategy {

    @Override
    public Priority calculate(Impact impact, Urgency urgency, int businessCriticality) {
        if (impact == null || urgency == null) {
            throw new IllegalArgumentException("Impact and urgency are required");
        }
        BigDecimal factor = switch (businessCriticality) {
            case 1 -> BigDecimal.valueOf(1.0);
            case 2 -> BigDecimal.valueOf(1.25);
            case 3 -> BigDecimal.valueOf(1.5);
            case 4 -> BigDecimal.valueOf(2.0);
            default -> throw new IllegalArgumentException("Business criticality level must be 1-4");
        };
        return calculate(impact, urgency, factor, 0);
    }

    @Override
    public Priority calculate(Impact impact, Urgency urgency, BigDecimal criticalityFactor, int serviceWeight) {
        if (impact == null || urgency == null || criticalityFactor == null)
            throw new IllegalArgumentException("Impact, urgency, and criticality are required");
        if (criticalityFactor.compareTo(BigDecimal.ONE) < 0 || criticalityFactor.compareTo(BigDecimal.valueOf(2)) > 0)
            throw new IllegalArgumentException("Business criticality factor must be between 1.0 and 2.0");
        if (serviceWeight < 0 || serviceWeight > 4)
            throw new IllegalArgumentException("Service weight must be between 0 and 4");
        int impactValue = switch (impact) { case INDIVIDUAL -> 1; case DEPARTMENT -> 2; case ORGANIZATION_WIDE -> 4; };
        int urgencyValue = urgency.ordinal() + 1;
        double score = impactValue * urgencyValue * criticalityFactor.doubleValue() + serviceWeight;
        if (score >= 24) return Priority.P1_CRITICAL;
        if (score >= 14) return Priority.P2_HIGH;
        if (score >= 6) return Priority.P3_MEDIUM;
        return Priority.P4_LOW;
    }
}
