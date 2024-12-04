package com.linkedin.backend.features.ws.interceptor;

import com.linkedin.backend.features.authentication.utils.JsonWebToken;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class AuthenticationInterceptor implements HandshakeInterceptor {
    private final JsonWebToken jsonWebToken;

    public AuthenticationInterceptor(JsonWebToken jsonWebToken) {
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
