package com.iitsm.user.security;

import com.iitsm.core.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long expirationMillis;

    public JwtTokenProvider(
            @Value("${app.jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}") String base64Secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMillis) {
        byte[] keyBytes;
        try {
            if (base64Secret == null || base64Secret.trim().isEmpty()) {
                base64Secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
            }
            keyBytes = Decoders.BASE64.decode(base64Secret);
        } catch (RuntimeException exception) {
            keyBytes = Decoders.BASE64.decode("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        }
        if (keyBytes.length < 32) {
            keyBytes = Decoders.BASE64.decode("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        }
        if (expirationMillis <= 0) {
            expirationMillis = 86400000;
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMillis = expirationMillis;
    }

    public String issueToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMillis)))
                .signWith(signingKey)
                .compact();
    }

    public String getSubject(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }
}
