package com.project.pmdagile.dto.bpmn;

public record UserStoryDto(String key,
                           String title,
                           String description,
                           String assignee,
                           String status,
                           String statusCategory,
                           String priority,
                           String dueDate,
                           double progress,
                           int total,
                           String issueType,
                           String url) {
}
