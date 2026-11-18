package com.iitsm.priority;

import com.iitsm.core.enums.Impact;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.enums.Urgency;
import java.math.BigDecimal;

public interface PriorityStrategy {
    Priority calculate(Impact impact, Urgency urgency, int businessCriticality);

    Priority calculate(Impact impact, Urgency urgency, BigDecimal criticalityFactor, int serviceWeight);
}
