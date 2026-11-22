package com.iitsm.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Component
@Slf4j
public class GreenApiWhatsAppClient {

    private static final String GREEN_API_URL = "https://7107.api.greenapi.com";
    private static final String ID_INSTANCE = "710722810067";
    private static final String API_TOKEN = "aaa929a2de6c4288b62ac705f28741423cce6f1b73a340cd87";
    public static final String DEFAULT_PHONE = "919082829190";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean sendMessage(String rawPhone, String message) {
        String chatId = normalizeChatId(rawPhone);
        String endpoint = String.format("%s/waInstance%s/sendMessage/%s", GREEN_API_URL, ID_INSTANCE, API_TOKEN);

        try {
            String jsonPayload = String.format("""
                {
                  "chatId": "%s",
                  "message": "%s"
                }
                """, chatId, escapeJson(message));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(12))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("[GREEN-API WHATSAPP] Successfully sent WhatsApp alert to {} (HTTP {})", chatId, response.statusCode());
                return true;
            } else {
                log.warn("[GREEN-API WHATSAPP] Failed to send to {}: HTTP {} -> {}", chatId, response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.warn("[GREEN-API WHATSAPP] Exception dispatching WhatsApp alert to {}: {}", chatId, e.getMessage());
            return false;
        }
    }

    private String normalizeChatId(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) {
            return DEFAULT_PHONE + "@c.us";
        }
        String clean = rawPhone.replaceAll("\\D", "");
        if (clean.length() == 10) {
            return "91" + clean + "@c.us";
        }
        if (clean.length() >= 11) {
            return clean + "@c.us";
        }
        return DEFAULT_PHONE + "@c.us";
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        return raw.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\b", "\\b")
                  .replace("\f", "\\f")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
