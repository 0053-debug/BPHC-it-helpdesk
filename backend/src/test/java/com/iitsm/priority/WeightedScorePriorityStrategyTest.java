package com.iitsm.priority;

import com.iitsm.core.enums.Impact;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.enums.Urgency;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class WeightedScorePriorityStrategyTest {
    private final WeightedScorePriorityStrategy strategy = new WeightedScorePriorityStrategy();

    @Test void missionCriticalOrganizationWideCriticalityIsP1() {
        assertEquals(Priority.P1_CRITICAL, strategy.calculate(Impact.ORGANIZATION_WIDE, Urgency.CRITICAL, BigDecimal.valueOf(2), 4));
    }
    @Test void scoreAtTwentyFourIsP1() {
        assertEquals(Priority.P1_CRITICAL, strategy.calculate(Impact.ORGANIZATION_WIDE, Urgency.HIGH, BigDecimal.valueOf(2), 0));
    }
    @Test void scoreAtFourteenIsP2() {
        assertEquals(Priority.P2_HIGH, strategy.calculate(Impact.DEPARTMENT, Urgency.CRITICAL, BigDecimal.valueOf(1.25), 4));
    }
    @Test void scoreAtSixIsP3() {
        assertEquals(Priority.P3_MEDIUM, strategy.calculate(Impact.DEPARTMENT, Urgency.MEDIUM, BigDecimal.valueOf(1.25), 1));
    }
    @Test void scoreBelowSixIsP4() {
        assertEquals(Priority.P4_LOW, strategy.calculate(Impact.INDIVIDUAL, Urgency.LOW, BigDecimal.ONE, 0));
    }
    @Test void serviceWeightOutsideAllowedRangeIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(Impact.INDIVIDUAL, Urgency.LOW, BigDecimal.ONE, 5));
    }
    @Test void nullImpactIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(null, Urgency.LOW, BigDecimal.ONE, 0));
    }
}
