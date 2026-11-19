package com.iitsm.duplicate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Component
public class GeminiEmbeddingClient implements EmbeddingClient {

    private static final String URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

    private final String apiKey;
    private final RestClient restClient;

    public GeminiEmbeddingClient(@Value("${GEMINI_API_KEY:}") String apiKey) {
        this.apiKey = apiKey;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    @Override
    public double[] embed(String text) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new EmbeddingUnavailableException("GEMINI_API_KEY is not configured");
        }
        Map<String, Object> body = Map.of(
                "model", "models/gemini-embedding-001",
                "content", Map.of("parts", List.of(Map.of("text", text))));
        try {
            Map<?, ?> response = restClient.post()
                    .uri(URL)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            return parseVector(response);
        } catch (RestClientException e) {
            throw new EmbeddingUnavailableException("Embedding API call failed", e);
        }
    }

    private double[] parseVector(Map<?, ?> response) {
        Object embedding = (response == null) ? null : response.get("embedding");
        Object values = (embedding instanceof Map<?, ?> map) ? map.get("values") : null;
        if (!(values instanceof List<?> list) || list.isEmpty()) {
            throw new EmbeddingUnavailableException("Embedding API returned an unexpected response");
        }
        double[] vector = new double[list.size()];
        for (int i = 0; i < vector.length; i++) {
            vector[i] = ((Number) list.get(i)).doubleValue();
        }
        return vector;
    }
}
