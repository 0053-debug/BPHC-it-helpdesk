package com.iitsm.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@Component
@Slf4j
public class EmailJsClient {

    private static final String EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";
    private static final String ORIGIN = "https://bphc-it-helpdesk.web.app";

    @Value("${emailjs.service-id:service_2c6usin}")
    private String serviceId;

    @Value("${emailjs.public-key:CzMJDOJR9b-LtHStA}")
    private String publicKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean sendEmail(String templateId, Map<String, String> templateParams) {
        try {
            StringBuilder paramsJson = new StringBuilder("{");
            int i = 0;
            for (Map.Entry<String, String> entry : templateParams.entrySet()) {
                if (i > 0) paramsJson.append(",");
                paramsJson.append("\"").append(escapeJson(entry.getKey())).append("\":\"")
                          .append(escapeJson(entry.getValue())).append("\"");
                i++;
            }
            paramsJson.append("}");

            String jsonPayload = String.format("""
                {
                  "service_id": "%s",
                  "template_id": "%s",
                  "user_id": "%s",
                  "template_params": %s
                }
                """, serviceId, templateId, publicKey, paramsJson);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(EMAILJS_URL))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .header("Origin", ORIGIN)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                log.info("EmailJS HTTPS dispatch succeeded for template: {}", templateId);
                return true;
            } else {
                log.warn("EmailJS HTTPS dispatch returned status {}: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception ex) {
            log.warn("EmailJS HTTPS dispatch failed: {}", ex.getMessage());
            return false;
        }
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
