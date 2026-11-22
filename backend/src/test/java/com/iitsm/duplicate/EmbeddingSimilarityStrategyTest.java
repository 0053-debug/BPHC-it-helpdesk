package com.iitsm.duplicate;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class EmbeddingSimilarityStrategyTest {

    private final EmbeddingClient client = mock(EmbeddingClient.class);
    private final TextSimilarityService jaccard = new TextSimilarityService();
    private final EmbeddingSimilarityStrategy strategy =
            new EmbeddingSimilarityStrategy(client, jaccard);

    @Test
    void vectorsPointingTheSameWayScoreOne() {
        when(client.embed("payment failing")).thenReturn(new double[]{1, 2, 3});
        when(client.embed("unable to pay")).thenReturn(new double[]{2, 4, 6});

        assertEquals(1.0, strategy.similarity("payment failing", "unable to pay"), 0.0001);
    }

    @Test
    void unrelatedVectorsScoreZero() {
        when(client.embed("payment failing")).thenReturn(new double[]{1, 0});
        when(client.embed("printer out of toner")).thenReturn(new double[]{0, 1});

        assertEquals(0.0, strategy.similarity("payment failing", "printer out of toner"), 0.0001);
    }

    @Test
    void fallsBackToWordOverlapWhenApiFails() {
        when(client.embed(anyString())).thenThrow(new EmbeddingUnavailableException("down"));

        String a = "Payment application unavailable";
        String b = "Payment application is unavailable for users";

        assertEquals(jaccard.similarity(a, b), strategy.similarity(a, b), 0.0001);
    }

    @Test
    void sameTextIsOnlySentToTheApiOnce() {
        when(client.embed("payment down")).thenReturn(new double[]{1, 1});

        strategy.similarity("payment down", "payment down");
        strategy.similarity("payment down", "payment down");

        verify(client, times(1)).embed("payment down");
    }

    @Test
    void blankTextScoresZeroWithoutCallingTheApi() {
        assertEquals(0.0, strategy.similarity("   ", "payment down"), 0.0001);
        assertEquals(0.0, strategy.similarity(null, "payment down"), 0.0001);

        verifyNoInteractions(client);
    }

    @Test
    void vectorsOfDifferentLengthScoreZero() {
        assertEquals(0.0,
                EmbeddingSimilarityStrategy.cosine(new double[]{1, 2}, new double[]{1, 2, 3}),
                0.0001);
    }
}
