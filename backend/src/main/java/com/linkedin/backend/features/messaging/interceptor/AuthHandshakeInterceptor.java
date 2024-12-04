package com.linkedin.backend.features.messaging.interceptor;

import com.linkedin.backend.features.authentication.utils.JsonWebToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class AuthHandshakeInterceptor implements HandshakeInterceptor {
    private static final Logger log = LoggerFactory.getLogger(AuthHandshakeInterceptor.class);
    private final JsonWebToken jsonWebToken;

    public AuthHandshakeInterceptor(JsonWebToken jsonWebToken) {
        this.jsonWebToken = jsonWebToken;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        String query = request.getURI().getQuery();

        if (query != null && query.contains("token=")) {
            String token = query.split("token=")[1];
            return !jsonWebToken.isTokenExpired(token);
        }

        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {

    }
}
