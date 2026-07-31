package com.project.pmdagile.dto.bpmn;

public record ProjectDto(Long id,
                         String name,
                         String description,
                         String jiraProjectKey) {
}
