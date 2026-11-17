package com.iitsm.duplicate;

public interface SimilarityStrategy {
    double similarity(String first, String second);
}