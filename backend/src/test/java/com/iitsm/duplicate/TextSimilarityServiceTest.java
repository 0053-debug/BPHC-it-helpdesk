package com.iitsm.duplicate;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TextSimilarityServiceTest {

    private final TextSimilarityService service = new TextSimilarityService();

    @Test
    void identicalTextScoresOne() {
        assertEquals(1.0, service.similarity("payment application down",
                "payment application down"), 0.0001);
    }

    @Test
    void relatedDescriptionsScoreHigh() {
        double score = service.similarity("Payment application unavailable",
                "Payment application is unavailable for users");
        assertTrue(score >= 0.4, "expected a high score but was " + score);
    }

    @Test
    void unrelatedDescriptionsScoreLow() {
        double score = service.similarity("Payment application unavailable",
                "Printer on third floor out of toner");
        assertTrue(score < 0.2, "expected a low score but was " + score);
    }

    @Test
    void caseAndPunctuationAreIgnored() {
        assertEquals(1.0, service.similarity("Wi-Fi DOWN!", "wi fi down"), 0.0001);
    }

    @Test
    void nullOrBlankTextScoresZero() {
        assertEquals(0.0, service.similarity(null, "payment down"), 0.0001);
        assertEquals(0.0, service.similarity("   ", "payment down"), 0.0001);
    }
}