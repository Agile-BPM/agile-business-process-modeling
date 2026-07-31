package com.project.pmdagile.dto;

public record UserDto(String firstname,
                      String lastname,
                      String email,
                      boolean isJiraAuthenticated) {
}
