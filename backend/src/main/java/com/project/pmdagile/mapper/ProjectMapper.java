package com.project.pmdagile.mapper;

import com.project.pmdagile.dto.bpmn.ProjectDto;
import com.project.pmdagile.model.Project;
import org.springframework.stereotype.Service;

@Service
public class ProjectMapper {
    public Project toProject(ProjectDto projectDto) {
        return Project.builder()
                .id(projectDto.id())
                .name(projectDto.name())
                .description(projectDto.description())
                .jiraProjectKey(projectDto.jiraProjectKey())
                .build();
    }

    public ProjectDto toProjectDto(Project project) {
        return new ProjectDto(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getJiraProjectKey()
        );
    }
}
