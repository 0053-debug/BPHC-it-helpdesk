package com.iitsm.priority;

import com.iitsm.core.enums.Impact;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.enums.Urgency;

public interface PriorityStrategy {
    Priority calculate(Impact impact, Urgency urgency, int businessCriticality);
}
