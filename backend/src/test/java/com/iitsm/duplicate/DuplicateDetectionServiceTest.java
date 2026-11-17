package com.iitsm.duplicate;

import com.iitsm.core.exception.IitsmException;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class DuplicateDetectionServiceTest {

    private final SimilarityStrategy strategy = mock(SimilarityStrategy.class);
    private final DuplicateDetectionService service = new DuplicateDetectionService(strategy, 0.75);

    @Test
    void returnsOnlyMatchesAboveThresholdSortedByScore() {
        when(strategy.similarity("new", "a")).thenReturn(0.80);
        when(strategy.similarity("new", "b")).thenReturn(0.30);
        when(strategy.similarity("new", "c")).thenReturn(0.95);

        List<DuplicateMatch> result = service.findDuplicates("new", List.of(
                new DuplicateCandidate(1L, "a"),
                new DuplicateCandidate(2L, "b"),
                new DuplicateCandidate(3L, "c")));

        assertEquals(2, result.size());
        assertEquals(3L, result.get(0).id());
        assertEquals(1L, result.get(1).id());
    }

    @Test
    void customThresholdOverridesDefault() {
        when(strategy.similarity("new", "a")).thenReturn(0.40);

        List<DuplicateMatch> result = service.findDuplicates("new",
                List.of(new DuplicateCandidate(1L, "a")), 0.3);

        assertEquals(1, result.size());
    }

    @Test
    void blankDescriptionThrows() {
        assertThrows(IitsmException.class,
                () -> service.findDuplicates("  ", List.of(new DuplicateCandidate(1L, "a"))));
    }

    @Test
    void nullOrEmptyCandidatesReturnEmptyList() {
        assertTrue(service.findDuplicates("new", null).isEmpty());
        assertTrue(service.findDuplicates("new", List.of()).isEmpty());
    }

    @Test
    void onlyFirstTwentyCandidatesAreCompared() {
        when(strategy.similarity(eq("new"), anyString())).thenReturn(0.9);
        List<DuplicateCandidate> many = new ArrayList<>();
        for (long i = 1; i <= 30; i++) {
            many.add(new DuplicateCandidate(i, "text " + i));
        }

        List<DuplicateMatch> result = service.findDuplicates("new", many);

        assertEquals(20, result.size());
        verify(strategy, times(20)).similarity(eq("new"), anyString());
    }
}
