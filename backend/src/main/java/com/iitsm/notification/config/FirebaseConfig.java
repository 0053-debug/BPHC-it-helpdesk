package com.iitsm.notification.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.InputStream;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${app.firebase.credentials-path:firebase-service-account.json}")
    private String credentialsPath;

    @Value("${app.firebase.enabled:false}")
    private boolean firebaseEnabled;

    @Bean
    public FirebaseMessaging firebaseMessaging() {
        if (!firebaseEnabled) {
            log.info("Firebase Push Notifications are currently disabled in configuration (app.firebase.enabled=false). Simulated mode active.");
            return null;
        }

        try {
            Resource resource = new FileSystemResource(credentialsPath);
            if (!resource.exists()) {
                resource = new ClassPathResource(credentialsPath);
            }

            if (!resource.exists()) {
                log.warn("Firebase credentials file not found at '{}'. Push notifications will run in mock/simulation mode.", credentialsPath);
                return null;
            }

            try (InputStream serviceAccount = resource.getInputStream()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                    log.info("Firebase Admin SDK successfully initialized for Mobile Push Notifications.");
                }
                return FirebaseMessaging.getInstance();
            }
        } catch (Exception e) {
            log.warn("Could not initialize Firebase Admin SDK: {}. Running in fallback simulation mode.", e.getMessage());
            return null;
        }
    }
}
