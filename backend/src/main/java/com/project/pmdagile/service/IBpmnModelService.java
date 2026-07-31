package com.project.pmdagile.service;

import com.project.pmdagile.dto.bpmn.BpmnModelDto;
import jakarta.mail.MessagingException;
import org.springframework.security.core.Authentication;

import java.util.List;

/**
 * Defines the service interface for managing and interacting with BPMN (Business Process Model and Notation) models.
 * Provides methods to retrieve and save BPMN models, enabling integration with authenticated users.
 */
public interface IBpmnModelService {
    List<BpmnModelDto> getBpmnModels(Authentication connectedUser);

    BpmnModelDto getBpmnModelById(Long id);

    Long createBpmnModel(BpmnModelDto bpmnModelDto, Authentication connectedUser);

    BpmnModelDto updateBpmnModel(Long id, BpmnModelDto updatedBpmnModelDto);

    void deleteBpmnModel(Long id);

    Long shareBpmnModelWithUser(Long modelId, String userEmail, Authentication connectedUser) throws MessagingException;

    List<BpmnModelDto> getBpmnModelsBySprintId(Long sprintId, Authentication connectedUser);

    Long createBpmnModelWithSprintId(BpmnModelDto bpmnModelDto, Long sprintId);

}
