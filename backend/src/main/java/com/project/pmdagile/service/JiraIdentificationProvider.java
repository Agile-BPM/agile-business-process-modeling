package com.project.pmdagile.service;

import com.project.pmdagile.auth.jira.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JiraIdentificationProvider {

    @Value("${jira.oauth.client.id}")
    private String clientId;
    @Value("${jira.oauth.client.secret}")
    private String clientSecret;

    private final JiraAccessTokenRepository jiraAccessTokenRepository;
    private final JiraCloudIdRepository cloudIdRepository;
    private final RestClient jiraAuthTokenClient;

    public void refreshAccessTokenIfExpired(String userEmail) {
        Optional<JiraAccessToken> token = jiraAccessTokenRepository.findByUserEmail(userEmail);
        if (token.isPresent() && token.get().isExpired()) {
            JiraAccessToken accessToken = token.get();
            RefreshAccessTokenRequest request = RefreshAccessTokenRequest.builder()
                    .grantType("refresh_token")
                    .clientId(clientId)
                    .clientSecret(clientSecret)
                    .refreshToken(accessToken.getRefreshToken())
                    .build();
            RefreshAccessTokenResponse response = jiraAuthTokenClient.post()
                    .body(request)
                    .retrieve()
                    .body(RefreshAccessTokenResponse.class);

            if (response == null || response.getAccessToken() == null) {
                throw new IllegalStateException("Failed to refresh access token for user: " + userEmail);
            }

            accessToken.setAccessToken(response.getAccessToken());
            accessToken.setRefreshToken(response.getRefreshToken());
            accessToken.setCreatedAt(LocalDateTime.now());
            accessToken.setExpiresIn(response.getExpiresIn());
            accessToken.setScope(response.getScope());
            jiraAccessTokenRepository.save(accessToken);
        }
    }

    public JiraAccessToken getApiToken(String userEmail) {
        return jiraAccessTokenRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("No token found for user: " + userEmail));
    }

    public JiraCloudId getCloudId(String userEmail) {
        return cloudIdRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("No cloud ID found for user: " + userEmail));
    }
}
