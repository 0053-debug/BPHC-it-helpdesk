package com.iitsm.priority;

import com.iitsm.core.enums.Impact;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.enums.Urgency;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class PriorityService {

    private final PriorityStrategy strategy;

    public PriorityService(PriorityStrategy strategy) {
        this.strategy = strategy;
    }

    public Priority determine(Impact impact, Urgency urgency, int businessCriticality) {
        return strategy.calculate(impact, urgency, businessCriticality);
    }

    public Priority determine(Impact impact, Urgency urgency, BigDecimal criticalityFactor, int serviceWeight) {
        return strategy.calculate(impact, urgency, criticalityFactor, serviceWeight);
    }

    public BigDecimal score(Impact impact, Urgency urgency, BigDecimal criticalityFactor, int serviceWeight) {
        int impactValue = switch (impact) { case INDIVIDUAL -> 1; case DEPARTMENT -> 2; case ORGANIZATION_WIDE -> 4; };
        int urgencyValue = urgency.ordinal() + 1;
        return criticalityFactor.multiply(BigDecimal.valueOf((long) impactValue * urgencyValue))
                .add(BigDecimal.valueOf(serviceWeight)).stripTrailingZeros();
    }
}

