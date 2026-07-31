package com.project.pmdagile.auth.jira;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JiraCloudIdRepository extends JpaRepository<JiraCloudId, Integer> {
    /**
     * Finds a JiraCloudId by the user's email.
     *
     * @param userEmail the email of the user
     * @return an Optional containing the JiraCloudId if found, otherwise empty
     */
    Optional<JiraCloudId> findByUserEmail(String userEmail);
}
