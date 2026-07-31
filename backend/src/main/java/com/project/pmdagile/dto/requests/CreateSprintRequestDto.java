package com.project.pmdagile.dto.requests;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record CreateSprintRequestDto(@NotNull(message = "Sprint name cannot be null")
                                     @NotEmpty(message = "Sprint name cannot be empty")
                                     String name,
                                     @NotNull(message = "Project cannot be null")
                                     @NotEmpty(message = "Project cannot be empty")
                                     Long projectId,
                                     String status,
                                     String initialBpmnModelXml) {
}
