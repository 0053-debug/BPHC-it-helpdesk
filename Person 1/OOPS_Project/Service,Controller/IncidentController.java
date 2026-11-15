package OOPS_Project;

import com.sun.net.httpserver.*;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class IncidentController {
    private final IncidentService incidentService;
    private HttpServer server;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    public void start(int port) throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/incidents", new IncidentHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("Incident REST server running on port " + port);
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    private class IncidentHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();

            // Handle CORS preflight requests from React frontend
            if ("OPTIONS".equalsIgnoreCase(method)) {
                addCorsHeaders(exchange);
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            try {
                if ("POST".equalsIgnoreCase(method) && path.equals("/api/incidents")) {
                    handleCreate(exchange);
                } else if ("GET".equalsIgnoreCase(method) && path.matches("/api/incidents/[A-Z0-9-]+")) {
                    handleGet(exchange);
                } else if ("PATCH".equalsIgnoreCase(method) && path.matches("/api/incidents/[A-Z0-9-]+/[a-z]+")) {
                    handleLifecycleAction(exchange, path);
                } else if ("POST".equalsIgnoreCase(method) && path.matches("/api/incidents/[A-Z0-9-]+/comments")) {
                    handleAddComment(exchange, path);
                } else {
                    sendResponse(exchange, 404, "{\"error\": \"Endpoint not found\"}");
                }
            } catch (Exception e) {
                String safeMsg = e.getMessage() != null ? escapeJson(e.getMessage()) : "Internal server error";
                sendResponse(exchange, 400, "{\"error\": \"" + safeMsg + "\"}");
            }
        }

        private void handleCreate(HttpExchange exchange) throws IOException {
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            // Extract fields from React's JSON payload without external libraries
            String title = extractJsonField(body, "title", "New Issue");
            String description = extractJsonField(body, "description", body);
            String category = extractJsonField(body, "category", "GENERAL");

            Incident created = incidentService.createIncident(new Incident(title, description, category));
            String responseJson = String.format(
                "{\"id\":\"%s\",\"title\":\"%s\",\"status\":\"%s\"}",
                created.getId(), escapeJson(created.getTitle()), created.getStatus()
            );
            sendResponse(exchange, 201, responseJson);
        }

        private void handleGet(HttpExchange exchange) throws IOException {
            String id = exchange.getRequestURI().getPath().replaceAll(".*/", "");
            Incident incident = incidentService.getIncident(id);

            // Build JSON array of comments for IncidentDetails.jsx
            StringBuilder commentsJson = new StringBuilder("[");
            List<IncidentComment> comments = incident.getComments();
            for (int i = 0; i < comments.size(); i++) {
                IncidentComment c = comments.get(i);
                commentsJson.append(String.format(
                    "{\"id\":\"%s\",\"authorId\":\"%s\",\"content\":\"%s\",\"timestamp\":\"%s\"}",
                    c.getId(), escapeJson(c.getAuthorId()), escapeJson(c.getContent()), c.getTimestamp()
                ));
                if (i < comments.size() - 1) {
                    commentsJson.append(",");
                }
            }
            commentsJson.append("]");

            String notesJson = incident.getResolutionNotes() != null 
                ? "\"" + escapeJson(incident.getResolutionNotes()) + "\"" 
                : "null";

            String responseJson = String.format(
                "{\"id\":\"%s\",\"title\":\"%s\",\"description\":\"%s\",\"category\":\"%s\",\"status\":\"%s\",\"resolutionNotes\":%s,\"comments\":%s}",
                incident.getId(),
                escapeJson(incident.getTitle()),
                escapeJson(incident.getDescription()),
                escapeJson(incident.getCategory()),
                incident.getStatus(),
                notesJson,
                commentsJson.toString()
            );
            sendResponse(exchange, 200, responseJson);
        }

        private void handleLifecycleAction(HttpExchange exchange, String path) throws IOException {
            String[] parts = path.split("/");
            String id = parts[3];
            String action = parts[4];
            Incident updated = null;

            switch (action) {
                case "classify":
                    updated = incidentService.classifyIncident(id);
                    break;
                case "assign":
                    updated = incidentService.assignIncident(id);
                    break;
                case "acknowledge":
                    updated = incidentService.acknowledgeIncident(id);
                    break;
                case "investigate":
                    updated = incidentService.investigateIncident(id);
                    break;
                case "resolve":
                    String notes = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                    updated = incidentService.resolveIncident(id, notes);
                    break;
                case "verify":
                    updated = incidentService.verifyIncident(id);
                    break;
                case "close":
                    updated = incidentService.closeIncident(id);
                    break;
                default:
                    sendResponse(exchange, 400, "{\"error\": \"Unknown action\"}");
                    return;
            }
            sendResponse(exchange, 200, String.format("{\"id\":\"%s\",\"status\":\"%s\"}", updated.getId(), updated.getStatus()));
        }

        private void handleAddComment(HttpExchange exchange, String path) throws IOException {
            String[] parts = path.split("/");
            String id = parts[3];
            String content = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);

            // Defaulting authorId until Person 2's JWT authentication is wired in
            IncidentComment comment = incidentService.addComment(id, "CURRENT_USER", content);

            String responseJson = String.format(
                "{\"id\":\"%s\",\"incidentId\":\"%s\",\"authorId\":\"%s\",\"content\":\"%s\",\"timestamp\":\"%s\"}",
                comment.getId(), comment.getIncidentId(), escapeJson(comment.getAuthorId()), escapeJson(comment.getContent()), comment.getTimestamp()
            );
            sendResponse(exchange, 201, responseJson);
        }

        private void addCorsHeaders(HttpExchange exchange) {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        }

        private void sendResponse(HttpExchange exchange, int statusCode, String responseText) throws IOException {
            addCorsHeaders(exchange);
            byte[] bytes = responseText.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(statusCode, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }

        // Helper to extract JSON string values without third-party dependencies
        private String extractJsonField(String json, String key, String defaultValue) {
            Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]*)\"");
            Matcher matcher = pattern.matcher(json);
            return matcher.find() ? matcher.group(1) : defaultValue;
        }

        // Helper to prevent quotes or newlines in text from breaking JSON responses
        private String escapeJson(String input) {
            if (input == null) return "";
            return input.replace("\\", "\\\\")
                        .replace("\"", "\\\"")
                        .replace("\n", "\\n")
                        .replace("\r", "\\r");
        }
    }
}