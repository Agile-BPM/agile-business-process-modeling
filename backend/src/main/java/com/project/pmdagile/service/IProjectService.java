package com.project.pmdagile.service;

import com.project.pmdagile.dto.bpmn.ProjectDto;
import com.project.pmdagile.dto.requests.CreateProjectRequestDto;
import jakarta.mail.MessagingException;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface IProjectService {
    List<ProjectDto> getProjects(Authentication connectedUser);

    ProjectDto getProjectById(Long id);

    Long createProject(CreateProjectRequestDto createProjectRequestDto, Authentication connectedUser);

    ProjectDto updateProject(Long id, ProjectDto updatedProjectDto);

    void deleteProject(Long id);

    ProjectDto linkProjectToJiraProject(Long id, String jiraProjectKey);

    Long shareProjectWithUser(Long projectId, String userEmail, Authentication connectedUser) throws MessagingException;
}
