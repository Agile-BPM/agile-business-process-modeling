package com.project.pmdagile.dto;

public record LinkIssueRequest(String userEmail, String authToken, String projectKey, String issueKey) {

}
