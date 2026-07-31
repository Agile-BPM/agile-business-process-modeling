package com.project.pmdagile.config;

import com.project.pmdagile.auth.security.JwtService;
import com.project.pmdagile.service.JiraIdentificationProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class TokenRefreshInterceptor implements HandlerInterceptor {

    private final JwtService jwtService;
    private final JiraIdentificationProvider jiraIdentificationProvider;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        String authHeader = request.getHeader("Authorization");
        String jwt = authHeader.substring(7);
        String userEmail = jwtService.extractUsername(jwt);
        try {
            jiraIdentificationProvider.refreshAccessTokenIfExpired(userEmail);
        } catch (Exception e) {
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.getWriter().write("Failed to refresh Jira access token: " + e.getMessage());
            return false;
        }
        return true;
    }
}
