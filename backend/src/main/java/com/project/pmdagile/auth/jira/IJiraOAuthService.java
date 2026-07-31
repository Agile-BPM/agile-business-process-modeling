package com.project.pmdagile.auth.jira;

public interface IJiraOAuthService {
    String generateJiraRedirectUrl(String userEmail);
    void handleJiraCallback(String code, String state);
}
