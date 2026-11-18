package com.iitsm.duplicate;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Primary
public class TextSimilarityService implements SimilarityStrategy{

    private static final Set<String> STOP_WORDS = Set.of(
            "the", "a", "an", "is", "are", "to", "of", "and", "in", "on",
            "for", "it", "not", "my", "i", "unable", "cannot", "cant");

    // Jaccard similarity: shared words divided by all distinct words (0.0 to 1.0)
    @Override
    public double similarity(String first, String second) {
        Set<String> a = tokens(first);
        Set<String> b = tokens(second);
        if (a.isEmpty() || b.isEmpty()) {
            return 0.0;
        }
        Set<String> shared = new HashSet<>(a);
        shared.retainAll(b);
        Set<String> all = new HashSet<>(a);
        all.addAll(b);
        return (double) shared.size() / all.size();
    }

    Set<String> tokens(String text) {
        if (text == null || text.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(text.toLowerCase().replaceAll("[^a-z0-9 ]", " ").split("\\s+"))
                .filter(word -> !word.isBlank())
                .filter(word -> !STOP_WORDS.contains(word))
                .collect(Collectors.toSet());
    }
}
