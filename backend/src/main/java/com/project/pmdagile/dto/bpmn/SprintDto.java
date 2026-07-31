package com.project.pmdagile.dto.bpmn;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record SprintDto(Long id,
                        Long projectId,
                        @NotNull(message = "Sprint name cannot be null")
                        @NotEmpty(message = "Sprint name cannot be empty")
                        String name,
                        String status,
                        String startDate,
                        String endDate) {
}
