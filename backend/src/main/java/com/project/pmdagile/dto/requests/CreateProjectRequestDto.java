package com.project.pmdagile.dto.requests;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record CreateProjectRequestDto(@NotNull(message = "Project name cannot be null")
                                      @NotEmpty(message = "Project name cannot be empty")
                                      String name,
                                      String description,
                                      String initialBpmnXml,
                                      String jiraProjectKey) {
}
