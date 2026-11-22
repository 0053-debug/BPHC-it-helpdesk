package com.iitsm.duplicate;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Primary
@Service
public class EmbeddingSimilarityStrategy implements SimilarityStrategy {

    private final EmbeddingClient embeddingClient;
    private final TextSimilarityService fallback;
    private final Map<String, double[]> cache = new ConcurrentHashMap<>();

    public EmbeddingSimilarityStrategy(EmbeddingClient embeddingClient,
                                       TextSimilarityService fallback) {
        this.embeddingClient = embeddingClient;
        this.fallback = fallback;
    }

    @Override
    public double similarity(String first, String second) {
        if (first == null || first.isBlank() || second == null || second.isBlank()) {
            return 0.0;
        }
        try {
            double[] a = vectorFor(first);
            double[] b = vectorFor(second);
            return cosine(a, b);
        } catch (EmbeddingUnavailableException e) {
            // API down, no key, or timeout: use the word-overlap score instead
            return fallback.similarity(first, second);
        }
    }

    private double[] vectorFor(String text) {
        String key = text.trim().toLowerCase();
        double[] cached = cache.get(key);
        if (cached != null) {
            return cached;
        }
        double[] vector = embeddingClient.embed(text);
        cache.put(key, vector);
        return vector;
    }

    static double cosine(double[] a, double[] b) {
        if (a.length != b.length) {
            return 0.0;
        }
        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }
        double score = dot / (Math.sqrt(normA) * Math.sqrt(normB));
        return Math.max(0.0, Math.min(1.0, score));
    }
}