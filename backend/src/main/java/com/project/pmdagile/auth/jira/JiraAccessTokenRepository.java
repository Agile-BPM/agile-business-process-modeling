package com.project.pmdagile.auth.jira;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JiraAccessTokenRepository extends JpaRepository<JiraAccessToken, Integer> {
    Optional<JiraAccessToken> findByUserEmail(String userEmail);
}
