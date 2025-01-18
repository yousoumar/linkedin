package com.linkedin.backend.features.authentication.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.crypto.SecretKey;
import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Component
public class JsonWebToken {
    private final RestTemplate restTemplate;
    @Value("${jwt.secret.key}")
    private String secret;

    public JsonWebToken(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(getKey())
                .compact();
    }

    public String getEmailFromToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }


    public Claims getClaimsFromGoogleOauthIdToken(String idToken) {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange("https://www.googleapis.com/oauth2/v3/certs", HttpMethod.GET, null, new ParameterizedTypeReference<>() {
            });

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new IllegalArgumentException("Failed to fetch JWKs from Google.");
            }

            Map<String, Object> body = response.getBody();
            List<Map<String, Object>> keys = (List<Map<String, Object>>) body.get("keys");

            JwtParser jwtParser = Jwts.parser().keyLocator(header -> {
                String kid = (String) header.get("kid");

                for (Map<String, Object> key : keys) {
                    if (kid.equals(key.get("kid"))) {
                        try {
                            BigInteger modulus = new BigInteger(1, Base64.getUrlDecoder().decode((String) key.get("n")));
                            BigInteger exponent = new BigInteger(1, Base64.getUrlDecoder().decode((String) key.get("e")));
                            RSAPublicKeySpec rsaPublicKeySpec = new RSAPublicKeySpec(modulus, exponent);
                            return KeyFactory.getInstance(
                                    key.get("kty").toString()
                            ).generatePublic(rsaPublicKeySpec);
                        } catch (Exception e) {
                            throw new IllegalArgumentException("Failed to parse RSA public key.", e);
                        }
                    }
                }
                throw new IllegalArgumentException("Failed to locate JWK with kid: " + kid);
            }).build();

            return jwtParser.parseSignedClaims(idToken).getPayload();
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to validate ID token.", e);
        }
    }
}
