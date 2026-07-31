package com.project.pmdagile.dto.bpmn;

public record SubtaskDto(String key,
                         String title,
                         String description,
                         String assignee,
                         String status,
                         String statusCategory,
                         String priority,
                         String dueDate,
                         String issueType,
                         String url) {
}
