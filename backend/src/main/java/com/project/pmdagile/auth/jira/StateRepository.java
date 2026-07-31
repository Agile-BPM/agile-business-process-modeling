package com.project.pmdagile.auth.jira;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StateRepository extends JpaRepository<State, Integer> {
    Optional<State> findByStateId(String stateId);
}
