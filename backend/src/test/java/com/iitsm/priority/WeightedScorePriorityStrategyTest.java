package com.iitsm.priority;

import com.iitsm.core.enums.Impact;
import com.iitsm.core.enums.Priority;
import com.iitsm.core.enums.Urgency;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class WeightedScorePriorityStrategyTest {

    private final WeightedScorePriorityStrategy strategy = new WeightedScorePriorityStrategy();

    @Test
    void maximumScoreIsP1() {
        // 3 x 4 x 5 = 60
        assertEquals(Priority.P1_CRITICAL,
                strategy.calculate(Impact.ORGANIZATION_WIDE, Urgency.CRITICAL, 5));
    }

    @Test
    void scoreOf40IsP1() {
        // 2 x 4 x 5 = 40, boundary
        assertEquals(Priority.P1_CRITICAL,
                strategy.calculate(Impact.DEPARTMENT, Urgency.CRITICAL, 5));
    }

    @Test
    void scoreOf36IsP2() {
        // 3 x 3 x 4 = 36, just below the P1 boundary
        assertEquals(Priority.P2_HIGH,
                strategy.calculate(Impact.ORGANIZATION_WIDE, Urgency.HIGH, 4));
    }

    @Test
    void scoreOf20IsP2() {
        // 2 x 2 x 5 = 20, boundary
        assertEquals(Priority.P2_HIGH,
                strategy.calculate(Impact.DEPARTMENT, Urgency.MEDIUM, 5));
    }

    @Test
    void scoreOf18IsP3() {
        // 3 x 2 x 3 = 18, just below the P2 boundary
        assertEquals(Priority.P3_MEDIUM,
                strategy.calculate(Impact.ORGANIZATION_WIDE, Urgency.MEDIUM, 3));
    }

    @Test
    void scoreOf8IsP3() {
        // 2 x 2 x 2 = 8, boundary
        assertEquals(Priority.P3_MEDIUM,
                strategy.calculate(Impact.DEPARTMENT, Urgency.MEDIUM, 2));
    }

    @Test
    void scoreOf6IsP4() {
        // 1 x 3 x 2 = 6, just below the P3 boundary
        assertEquals(Priority.P4_LOW,
                strategy.calculate(Impact.INDIVIDUAL, Urgency.HIGH, 2));
    }

    @Test
    void minimumScoreIsP4() {
        // 1 x 1 x 1 = 1
        assertEquals(Priority.P4_LOW,
                strategy.calculate(Impact.INDIVIDUAL, Urgency.LOW, 1));
    }

    @Test
    void criticalityBelowRangeThrows() {
        assertThrows(IllegalArgumentException.class,
                () -> strategy.calculate(Impact.INDIVIDUAL, Urgency.LOW, 0));
    }

    @Test
    void criticalityAboveRangeThrows() {
        assertThrows(IllegalArgumentException.class,
                () -> strategy.calculate(Impact.INDIVIDUAL, Urgency.LOW, 6));
    }

    @Test
    void nullImpactThrows() {
        assertThrows(IllegalArgumentException.class,
                () -> strategy.calculate(null, Urgency.LOW, 3));
    }
}
