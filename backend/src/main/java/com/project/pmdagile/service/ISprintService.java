package com.project.pmdagile.service;

import com.project.pmdagile.dto.bpmn.BpmnModelDto;
import com.project.pmdagile.dto.bpmn.SprintDto;
import com.project.pmdagile.dto.requests.CreateSprintRequestDto;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ISprintService {

    List<SprintDto> getSprintsByProjectId(Long projectId);

    SprintDto getSprintById(Long id);

    Long createSprint(CreateSprintRequestDto createSprintRequestDto, Authentication connectedUser);

    SprintDto updateSprint(Long id, SprintDto updatedSprintDto);

    void deleteSprint(Long id);

    SprintDto endSprint(Long sprintId);

    SprintDto addBpmnModelToSprint(Long sprintId, BpmnModelDto bpmnModelDto, Authentication connectedUser);

    BpmnModelDto getCurrentBpmnModelForSprint(Long sprintId, Authentication connectedUser);
}
