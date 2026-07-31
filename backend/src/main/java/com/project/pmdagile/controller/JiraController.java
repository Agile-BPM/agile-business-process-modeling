package com.project.pmdagile.controller;

import com.project.pmdagile.dto.bpmn.EpicDto;
import com.project.pmdagile.dto.bpmn.JiraProjectDto;
import com.project.pmdagile.dto.bpmn.SubtaskDto;
import com.project.pmdagile.dto.bpmn.UserStoryDto;
import com.project.pmdagile.service.IJiraService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/jira")
@RequiredArgsConstructor
@Tag(name = "PMDAgile Jira Integration", description = "Endpoints for interacting with Jira projects and issues")
public class JiraController {

    private final IJiraService jiraService;

    @GetMapping("/projects")
    public ResponseEntity<List<JiraProjectDto>> getAllJiraProjects(Authentication connectedUser) {
        return ResponseEntity.ok(jiraService.getAllProjects(connectedUser));
    }

    // Project endpoints

    @GetMapping("/projects/{projectKey}/epics")
    public ResponseEntity<List<EpicDto>> getAllJiraEpicsForProject(@PathVariable String projectKey, Authentication connectedUser) {
        return ResponseEntity.ok(jiraService.getAllEpicsForProject(projectKey, connectedUser));
    }

    @GetMapping("/projects/{projectKey}/epics/{epicId}")
    public ResponseEntity<EpicDto> getJiraEpicInformation(@PathVariable String projectKey, @PathVariable String epicId, Authentication connectedUser) {
        return ResponseEntity.ok(jiraService.retrieveEpicInformationFromJira(projectKey, epicId, connectedUser));
    }

    // User Story endpoints

    @GetMapping("/projects/{projectKey}/stories")
    public ResponseEntity<List<UserStoryDto>> getAllJiraStoriesForProject(@PathVariable String projectKey, Authentication connectedUser) {
        return ResponseEntity.ok(jiraService.getAllUserStoriesForProject(projectKey, connectedUser));
    }

    @GetMapping("/projects/{projectKey}/stories/{storyId}")
    public ResponseEntity<UserStoryDto> getJiraStoryInformation(@PathVariable String projectKey, @PathVariable String storyId, Authentication connectedUser) {
        return ResponseEntity.ok(jiraService.retrieveStoryInformationFromJira(projectKey, storyId, connectedUser));
    }


    // Subtask endpoints

    @GetMapping("/projects/{projectKey}/subtasks")
    public ResponseEntity<List<SubtaskDto>> getAllJiraSubtasksForProject(@PathVariable String projectKey, Authentication connectedUser) {
        return ResponseEntity.ok(jiraService.getAllSubtasksForProject(projectKey, connectedUser));
    }


    @GetMapping("/projects/{projectKey}/subtasks/{subtaskId}")
    public ResponseEntity<SubtaskDto> getJiraSubtaskInformation(@PathVariable String projectKey, @PathVariable String subtaskId, Authentication connectedUser) {
        return ResponseEntity.ok(jiraService.retrieveSubtaskInformationFromJira(projectKey, subtaskId, connectedUser));
    }
}
