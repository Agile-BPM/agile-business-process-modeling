package com.project.pmdagile.dto.requests;

public record CreateBpmnModelRequestDto(Long sprintId,
                                        String name,
                                        String bpmnXml) {
}
