package com.project.pmdagile.dto.bpmn;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record BpmnModelDto(Long id,
                           Long sprintId,
                           @NotNull(message = "Model name cannot be null")
                           @NotEmpty(message = "Model name cannot be empty")
                           String name,
                           String bpmnXml) {
}
