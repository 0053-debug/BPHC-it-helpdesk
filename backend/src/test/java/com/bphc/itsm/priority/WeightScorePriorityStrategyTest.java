package com.bphc.itsm.priority;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class WeightedScorePriorityStrategyTest {

    private final WeightedScorePriorityStrategy strategy = new WeightedScorePriorityStrategy();

    @Test
    void maximumScoreIsP1() {
        assertEquals(Priority.P1, strategy.calculate(3, 3, 5)); // 45
    }

    @Test
    void scoreOf36IsP1() {
        assertEquals(Priority.P1, strategy.calculate(3, 3, 4)); // 36, boundary
    }

    @Test
    void scoreOf18IsP2() {
        assertEquals(Priority.P2, strategy.calculate(3, 3, 2)); // 18, boundary
    }

    @Test
    void scoreOf12IsP3() {
        assertEquals(Priority.P3, strategy.calculate(3, 2, 2)); // 12
    }

    @Test
    void scoreOf6IsP3() {
        assertEquals(Priority.P3, strategy.calculate(2, 1, 3)); // 6, boundary
    }

    @Test
    void scoreOf5IsP4() {
        assertEquals(Priority.P4, strategy.calculate(1, 1, 5)); // 5
    }

    @Test
    void minimumScoreIsP4() {
        assertEquals(Priority.P4, strategy.calculate(1, 1, 1)); // 1
    }

    @Test
    void invalidImpactThrows() {
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(0, 1, 1));
    }

    @Test
    void invalidCriticalityThrows() {
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(1, 1, 6));
    }
}
