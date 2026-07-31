package com.project.pmdagile.service;

import com.project.pmdagile.dto.bpmn.EpicDto;
import com.project.pmdagile.dto.bpmn.JiraProjectDto;
import com.project.pmdagile.dto.bpmn.SubtaskDto;
import com.project.pmdagile.dto.bpmn.UserStoryDto;
import org.springframework.security.core.Authentication;

import java.util.List;

/**
 * Defines the service interface for interacting with Jira projects and issues.
 * Provides methods to retrieve projects, epics, user stories, and subtasks,
 * as well as to fetch detailed information for individual issues.
 */
public interface IJiraService {

    /**
     * Retrieves all Jira projects for the connected user.
     *
     * @param connectedUser The authentication of the connected user.
     * @return List of all projects.
     */
    List<JiraProjectDto> getAllProjects(Authentication connectedUser);

    /**
     * Retrieves all epics for a specific project.
     *
     * @param projectKey    The key of the project.
     * @param connectedUser The authentication of the connected user.
     * @return List of all epics in the project.
     */
    List<EpicDto> getAllEpicsForProject(String projectKey, Authentication connectedUser);

    /**
     * Retrieves all user stories for a specific project.
     *
     * @param projectKey    The key of the project.
     * @param connectedUser The authentication of the connected user.
     * @return List of all user stories in the project.
     */
    List<UserStoryDto> getAllUserStoriesForProject(String projectKey, Authentication connectedUser);

    /**
     * Retrieves all subtasks for a specific project.
     *
     * @param projectKey    The key of the project.
     * @param connectedUser The authentication of the connected user.
     * @return List of all subtasks in the project.
     */
    List<SubtaskDto> getAllSubtasksForProject(String projectKey, Authentication connectedUser);

    /**
     * Retrieves detailed information for an epic from Jira.
     *
     * @param projectKey    The key of the project.
     * @param epicId        The ID of the epic.
     * @param connectedUser The authentication of the connected user.
     * @return The epic with all details.
     */
    EpicDto retrieveEpicInformationFromJira(String projectKey, String epicId, Authentication connectedUser);

    /**
     * Retrieves detailed information for a user story from Jira.
     *
     * @param projectKey    The key of the project.
     * @param storyId       The ID of the user story.
     * @param connectedUser The authentication of the connected user.
     * @return The user story with all details.
     */
    UserStoryDto retrieveStoryInformationFromJira(String projectKey, String storyId, Authentication connectedUser);

    /**
     * Retrieves detailed information for a subtask from Jira.
     *
     * @param projectKey    The key of the project.
     * @param subtaskId     The ID of the subtask.
     * @param connectedUser The authentication of the connected user.
     * @return The subtask with all details.
     */
    SubtaskDto retrieveSubtaskInformationFromJira(String projectKey, String subtaskId, Authentication connectedUser);
}