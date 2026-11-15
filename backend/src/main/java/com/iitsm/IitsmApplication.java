package com.iitsm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class IitsmApplication {

    public static void main(String[] args) {
        loadDotEnvIfPresent();
        SpringApplication.run(IitsmApplication.class, args);
    }

    private static void loadDotEnvIfPresent() {
        Path envPath = Paths.get(".env");
        if (!Files.exists(envPath)) {
            envPath = Paths.get("..", ".env");
        }
        if (Files.exists(envPath)) {
            try {
                List<String> lines = Files.readAllLines(envPath);
                for (String rawLine : lines) {
                    String line = rawLine.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String val = line.substring(eqIdx + 1).trim();
                        if ((val.startsWith("\"") && val.endsWith("\"")) ||
                            (val.startsWith("'") && val.endsWith("'"))) {
                            val = val.substring(1, val.length() - 1);
                        }
                        if (System.getProperty(key) == null) {
                            System.setProperty(key, val);
                        }
                    }
                }
            } catch (IOException ignored) {
            }
        }
    }
}
