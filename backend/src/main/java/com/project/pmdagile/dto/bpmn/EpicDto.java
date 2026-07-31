package com.project.pmdagile.dto.bpmn;

public record EpicDto(String key,
                      String title,
                      String description,
                      String status,
                      String statusCategory,
                      String dueDate,
                      double progress,
                      int total,
                      String issueType,
                      String url) {
}
