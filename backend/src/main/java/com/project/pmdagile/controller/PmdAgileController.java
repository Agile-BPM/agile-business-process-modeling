package com.project.pmdagile.controller;

import com.project.pmdagile.auth.user.User;
import com.project.pmdagile.dto.UserDto;
import com.project.pmdagile.dto.bpmn.BpmnModelDto;
import com.project.pmdagile.dto.bpmn.ProjectDto;
import com.project.pmdagile.dto.bpmn.SprintDto;
import com.project.pmdagile.dto.requests.CreateProjectRequestDto;
import com.project.pmdagile.dto.requests.CreateSprintRequestDto;
import com.project.pmdagile.mapper.UserMapper;
import com.project.pmdagile.service.IBpmnModelService;
import com.project.pmdagile.service.IProjectService;
import com.project.pmdagile.service.ISprintService;
import com.project.pmdagile.websocket.LiveEditStatusService;
import com.project.pmdagile.websocket.dto.ModelEditStatusDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Process Model Driven Agile Application")
public class PmdAgileController {

    private final IBpmnModelService bpmnModelService;
    private final IProjectService projectService;
    private final ISprintService sprintService;
    private final UserMapper userMapper;
    private final LiveEditStatusService liveEditStatusService;

    @GetMapping("/user")
    public ResponseEntity<UserDto> getConnectedUser(Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        return ResponseEntity.ok(userMapper.toUserDto(user));
    }

    @GetMapping("/models")
    public ResponseEntity<List<BpmnModelDto>> getModels(Authentication connectedUser) {
        return ResponseEntity.ok(bpmnModelService.getBpmnModels(connectedUser));
    }

    @GetMapping("/models/{id}")
    public ResponseEntity<BpmnModelDto> getModelById(@PathVariable Long id) {
        return ResponseEntity.ok(bpmnModelService.getBpmnModelById(id));
    }

    @PostMapping("/models")
    public ResponseEntity<Long> saveModel(@RequestBody @Valid BpmnModelDto bpmnModelDto, Authentication connectedUser) {
        return ResponseEntity.ok(bpmnModelService.createBpmnModel(bpmnModelDto, connectedUser));
    }

    @PutMapping("/models/{id}")
    public ResponseEntity<BpmnModelDto> updateModel(@PathVariable Long id, @RequestBody @Valid BpmnModelDto updatedBpmnModelDto) {
        return ResponseEntity.ok(bpmnModelService.updateBpmnModel(id, updatedBpmnModelDto));
    }

    @DeleteMapping("/models/{id}")
    public ResponseEntity<Void> deleteModel(@PathVariable Long id) {
        bpmnModelService.deleteBpmnModel(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/models/{id}/share")
    public ResponseEntity<Long> shareModelWithUser(@PathVariable Long id, @RequestBody String userEmail, Authentication connectedUser) throws MessagingException {
        return ResponseEntity.ok(bpmnModelService.shareBpmnModelWithUser(id, userEmail, connectedUser));
    }

    @GetMapping("/models/{id}/edit-status")
    public ResponseEntity<ModelEditStatusDto> getModelEditStatus(@PathVariable Long id) {
        return ResponseEntity.ok(liveEditStatusService.getModelEditStatus(id));
    }

    @GetMapping("/projects")
    public ResponseEntity<List<ProjectDto>> getAllProjects(Authentication connectedUser) {
        return ResponseEntity.ok(projectService.getProjects(connectedUser));
    }

    @PostMapping("/projects")
    public ResponseEntity<Long> createProject(@RequestBody @Valid CreateProjectRequestDto createProjectRequestDto, Authentication connectedUser) {
        return ResponseEntity.ok(projectService.createProject(createProjectRequestDto, connectedUser));
    }

    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/projects/{projectId}/share")
    public ResponseEntity<Long> shareProjectWithUser(@PathVariable Long projectId, @RequestBody String userEmail, Authentication connectedUser) throws MessagingException {
        return ResponseEntity.ok(projectService.shareProjectWithUser(projectId, userEmail, connectedUser));
    }

    @PostMapping("/projects/{projectId}/jira-link")
    public ResponseEntity<ProjectDto> linkProjectToJiraProject(@PathVariable Long projectId, @RequestBody String jiraProjectKey) {
        return ResponseEntity.ok(projectService.linkProjectToJiraProject(projectId, jiraProjectKey));
    }

    @GetMapping("/projects/{projectId}/sprints")
    public ResponseEntity<List<SprintDto>> getSprintsByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(sprintService.getSprintsByProjectId(projectId));
    }

    @GetMapping("/sprints/{sprintId}")
    public ResponseEntity<SprintDto> getSprintById(@PathVariable Long sprintId) {
        return ResponseEntity.ok(sprintService.getSprintById(sprintId));
    }

    @PostMapping("/sprints")
    public ResponseEntity<Long> createSprint(@RequestBody @Valid CreateSprintRequestDto createSprintRequestDto, Authentication connectedUser) {
        return ResponseEntity.ok(sprintService.createSprint(createSprintRequestDto, connectedUser));
    }

    @DeleteMapping("/sprints/{sprintId}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Long sprintId) {
        sprintService.deleteSprint(sprintId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sprints/{sprintId}/models")
    public ResponseEntity<List<BpmnModelDto>> getBpmnModelsBySprintId(@PathVariable Long sprintId, Authentication connectedUser) {
        return ResponseEntity.ok(bpmnModelService.getBpmnModelsBySprintId(sprintId, connectedUser));
    }
}
