package com.project.pmdagile.service.implementation;

import com.project.pmdagile.auth.email.EmailService;
import com.project.pmdagile.auth.user.User;
import com.project.pmdagile.auth.user.UserRepository;
import com.project.pmdagile.dto.bpmn.ProjectDto;
import com.project.pmdagile.dto.requests.CreateProjectRequestDto;
import com.project.pmdagile.mapper.ProjectMapper;
import com.project.pmdagile.model.BpmnModel;
import com.project.pmdagile.model.Project;
import com.project.pmdagile.model.Sprint;
import com.project.pmdagile.repository.BpmnModelRepository;
import com.project.pmdagile.repository.ProjectRepository;
import com.project.pmdagile.repository.SprintRepository;
import com.project.pmdagile.service.IProjectService;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static java.time.LocalDateTime.now;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProjectServiceImpl implements IProjectService {

    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final BpmnModelRepository bpmnModelRepository;
    private final ProjectMapper projectMapper;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    public List<ProjectDto> getProjects(Authentication connectedUser) {
        String email = connectedUser.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return Stream.concat(user.getOwnedProjects().stream(), user.getSharedProjects().stream())
                .distinct()
                .sorted(Comparator.comparing(Project::getId))
                .map(projectMapper::toProjectDto)
                .toList();
    }

    @Override
    public ProjectDto getProjectById(Long id) {
        return projectRepository.findById(id)
                .map(projectMapper::toProjectDto)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }

    @Override
    @Transactional
    public Long createProject(CreateProjectRequestDto createProjectRequestDto, Authentication connectedUser) {
        Project project = createAndSaveProject(createProjectRequestDto, connectedUser);
        if (StringUtils.hasLength(createProjectRequestDto.initialBpmnXml())) {
            Sprint sprint = createAndSaveInitialSprint(project);
            createAndSaveInitialBpmnModel(createProjectRequestDto.initialBpmnXml(), sprint);
        }
        return project.getId();
    }

    @Override
    @Transactional
    public ProjectDto updateProject(Long id, ProjectDto updatedProjectDto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        project.setName(updatedProjectDto.name());
        return projectMapper.toProjectDto(projectRepository.save(project));
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        projectRepository.findById(id).ifPresentOrElse(project -> projectRepository.deleteById(project.getId()),
                () -> log.warn("Project {} not found", id));
    }

    @Override
    @Transactional
    public ProjectDto linkProjectToJiraProject(Long id, String jiraProjectKey) {
        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isEmpty()) {
            log.warn("Project with id {} not found", id);
            throw new EntityNotFoundException("Project not found");
        }
        Project project = optionalProject.get();
        project.linkToJiraProject(jiraProjectKey);
        return projectMapper.toProjectDto(projectRepository.save(project));
    }

    @Override
    @Transactional
    public Long shareProjectWithUser(Long id, String userEmail, Authentication connectedUser) throws MessagingException {
        User owner = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"))
                .getOwner();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        if (!project.getOwner().getId().equals(owner.getId())) {
            log.warn("User {} is trying to share project {} they do not own", connectedUser.getName(), id);
            throw new EntityNotFoundException("You are not the owner of this project");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        emailService.sendShareModelWithEmail(userEmail, owner.getFirstname(), project.getName());
        project.shareWith(user);
        return projectRepository.save(project).getId();
    }

    private Project createAndSaveProject(CreateProjectRequestDto createProjectRequestDto, Authentication connectedUser) {
        User owner = (User) connectedUser.getPrincipal();
        ProjectDto projectDto = new ProjectDto(
                null,
                createProjectRequestDto.name(),
                createProjectRequestDto.description(),
                createProjectRequestDto.jiraProjectKey()
        );
        Project project = saveProject(projectDto, owner);
        log.info("Project '{}' created with id {}", project.getName(), project.getId());
        return project;
    }

    private Sprint createAndSaveInitialSprint(Project project) {
        Sprint sprint = Sprint.builder()
                .project(project)
                .name("Iteration Zero")
                .status("active")
                .startDate(now().toString())
                .build();
        sprintRepository.save(sprint);
        log.info("Sprint '{}' created for project '{}'", sprint.getName(), project.getName());
        return sprint;
    }

    private void createAndSaveInitialBpmnModel(String bpmnXml, Sprint sprint) {
        BpmnModel bpmnModel = BpmnModel.builder()
                .name("First Version")
                .bpmnXml(bpmnXml)
                .createdAt(now())
                .sprint(sprint)
                .build();
        bpmnModelRepository.save(bpmnModel);
        log.info("BPMN model '{}' created for sprint '{}'", bpmnModel.getName(), sprint.getName());
    }

    private Project saveProject(ProjectDto projectDto, User owner) {
        Project project = projectMapper.toProject(projectDto);
        project.setOwner(owner);
        return projectRepository.save(project);
    }
}
