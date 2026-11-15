package com.bphc.itsm.priority;

public interface PriorityStrategy {
    Priority calculate(int impact, int urgency , int businessCriticality);
}
