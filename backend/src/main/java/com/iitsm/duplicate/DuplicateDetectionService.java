package com.iitsm.duplicate;

import com.iitsm.core.exception.IitsmException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class DuplicateDetectionService {

    // Cap on comparisons per request, so one check cannot trigger hundreds of API calls
    static final int MAX_CANDIDATES = 20;

    private final SimilarityStrategy similarity;
    private final double defaultThreshold;

    public DuplicateDetectionService(SimilarityStrategy similarity,
                                     @Value("${duplicate.threshold:0.75}") double defaultThreshold) {
        this.similarity = similarity;
        this.defaultThreshold = defaultThreshold;
    }

    public List<DuplicateMatch> findDuplicates(String description, List<DuplicateCandidate> candidates) {
        return findDuplicates(description, candidates, defaultThreshold);
    }

    public List<DuplicateMatch> findDuplicates(String description,
                                               List<DuplicateCandidate> candidates,
                                               double threshold) {
        if (description == null || description.isBlank()) {
            throw new IitsmException("Description is required for duplicate detection");
        }
        if (candidates == null || candidates.isEmpty()) {
            return List.of();
        }
        return candidates.stream()
                .filter(c -> c != null && c.description() != null && !c.description().isBlank())
                .limit(MAX_CANDIDATES)
                .map(c -> new DuplicateMatch(c.id(), c.description(),
                        similarity.similarity(description, c.description())))
                .filter(m -> m.score() >= threshold)
                .sorted(Comparator.comparingDouble(DuplicateMatch::score).reversed())
                .toList();
    }
}
