package com.project.pmdagile.auth.jira;

import com.project.pmdagile.auth.user.User;
import com.project.pmdagile.auth.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class JiraOAuthService implements IJiraOAuthService {

    private final static String JIRA_OAUTH_STATE_PLACEHOLDER = "YOUR_USER_BOUND_VALUE";

    @Value("${jira.redirect.url:null}")
    private String jiraRedirectUrl;
    @Value("${jira.callback.url:null}")
    private String jiraCallbackUrl;
    @Value("${jira.oauth.client.id:null}")
    private String clientId;
    @Value("${jira.oauth.client.secret:null}")
    private String clientSecret;

    private final StateRepository stateRepository;
    private final UserRepository userRepository;
    private final JiraAccessTokenRepository jiraAccessTokenRepository;
    private final JiraCloudIdRepository jiraCloudIdRepository;

    private final RestClient jiraAuthTokenClient;
    private final RestClient jiraCloudIdClient;

    @Override
    public String generateJiraRedirectUrl(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User with email " + userEmail + " not found"));
        String state = generateAndSaveState(user);
        return jiraRedirectUrl.replace(JIRA_OAUTH_STATE_PLACEHOLDER, state);
    }

    @Override
    public void handleJiraCallback(String code, String state) {
        State correspondingState = stateRepository.findByStateId(state)
                .orElseThrow(() -> new IllegalArgumentException("Invalid state ID"));
        try {
            JiraAccessToken accessToken = storeAccessToken(code, correspondingState);
            storeCloudId(accessToken.getAccessToken(), correspondingState);
            accessToken.getUser().setJiraAuthenticated(true);
        } finally {
            stateRepository.delete(correspondingState);
        }
    }

    private void storeCloudId(String accessToken, State correspondingState) {
        JiraCloudId cloudId = getJiraCloudId(accessToken);
        if (cloudId == null) {
            throw new IllegalArgumentException("Failed to retrieve cloud ID for access token");
        }
        log.info("Received cloud ID for user: {}", correspondingState.getUser().getEmail());
        cloudId.setUser(correspondingState.getUser());
        jiraCloudIdRepository.save(cloudId);
    }

    private JiraAccessToken storeAccessToken(String code, State correspondingState) {
        JiraAccessToken accessToken = getAccessToken(code);
        if (accessToken == null) {
            throw new IllegalArgumentException("Failed to retrieve access token");
        }
        log.info("Received access token for user: {}", correspondingState.getUser().getEmail());
        User user = correspondingState.getUser();
        accessToken.setUser(user);

        return jiraAccessTokenRepository.save(accessToken);
    }

    private JiraCloudId getJiraCloudId(String accessToken) {
        List<JiraGetCloudIdResponse> response = jiraCloudIdClient.get()
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
        if (response == null || response.isEmpty()) {
            return null;
        }
        return JiraCloudId.builder()
                .cloudId(response.get(0).getId())
                .createdAt(LocalDateTime.now())
                .build();
    }

    private JiraAccessToken getAccessToken(String code) {
        ExchangeJiraAccessTokenRequest request = ExchangeJiraAccessTokenRequest.builder()
                .grantType("authorization_code")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .code(code)
                .redirectUri(jiraCallbackUrl)
                .build();
        ExchangeJiraAccessTokenResponse response = jiraAuthTokenClient.post()
                .body(request)
                .retrieve()
                .body(ExchangeJiraAccessTokenResponse.class);
        if (response == null || response.getAccessToken() == null) {
            return null;
        }

        return JiraAccessToken.builder()
                .accessToken(response.getAccessToken())
                .refreshToken(response.getRefreshToken())
                .expiresIn(response.getExpiresIn())
                .createdAt(LocalDateTime.now())
                .scope(response.getScope())
                .build();
    }

    private String generateAndSaveState(User user) {
        String generatedStateId = generateCode(10);
        var token = State.builder()
                .stateId(generatedStateId)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(60))
                .user(user)
                .build();

        stateRepository.save(token);
        return generatedStateId;
    }

    private String generateCode(int length) {
        String characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom secureRandom = new SecureRandom();

        for (int i = 0; i < length; i++) {
            int randomIndex = secureRandom.nextInt(characters.length());
            codeBuilder.append(characters.charAt(randomIndex));
        }

        return codeBuilder.toString();
    }
}
