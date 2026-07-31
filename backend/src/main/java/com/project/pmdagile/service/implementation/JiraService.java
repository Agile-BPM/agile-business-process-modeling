package com.project.pmdagile.service.implementation;

import com.project.pmdagile.auth.jira.JiraAccessToken;
import com.project.pmdagile.auth.user.User;
import com.project.pmdagile.dto.bpmn.EpicDto;
import com.project.pmdagile.dto.bpmn.JiraProjectDto;
import com.project.pmdagile.dto.bpmn.SubtaskDto;
import com.project.pmdagile.dto.bpmn.UserStoryDto;
import com.project.pmdagile.dto.jira.*;
import com.project.pmdagile.service.IJiraService;
import com.project.pmdagile.service.JiraIdentificationProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

import static java.util.Collections.emptyList;

@Slf4j
@Service
@RequiredArgsConstructor
public class JiraService implements IJiraService {
    private static final int JIRA_CLOUD_STATUS_CATEGORY_DONE_ID = 3; // ID for the "Done" status category in Jira

    private final JiraIdentificationProvider jiraIdentificationProvider;
    private final RestClient jiraApiClient;

    public List<JiraProjectDto> getAllProjects(Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        String cloudId = jiraIdentificationProvider.getCloudId(user.getEmail()).getCloudId();
        String authHeader = getBearerAuthenticationHeader(user);

        JiraProjectSearchResponse response = jiraApiClient.get()
                .uri(cloudId + "/rest/api/2/project/search")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .retrieve()
                .body(JiraProjectSearchResponse.class);

        if (response != null) {
            return response.getValues().stream()
                    .map(jiraProject -> new JiraProjectDto(
                            jiraProject.getId(),
                            jiraProject.getName()))
                    .toList();
        }
        return emptyList();
    }

    public List<EpicDto> getAllEpicsForProject(String projectKey, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        List<JiraIssue> allEpics = retrieveAllIssuesOfType(projectKey, "Epic", user);
        return allEpics.stream().map(epic -> {
                    JiraProgress progress = retrieveProgressForEpic(epic.getKey(), user);
                    return new EpicDto(
                            epic.getKey(),
                            epic.getFields().getSummary(),
                            epic.getFields().getDescription() != null ? epic.getFields().getDescription().getPlainText() : "",
                            epic.getFields().getStatus().getName(),
                            retrieveStatusCategoryKey(epic.getFields()),
                            epic.getFields().getDuedate(),
                            progress != null && progress.getTotal() != 0 ? ((double) progress.getProgress() / progress.getTotal()) : 0.0,
                            progress != null ? progress.getTotal() : 0,
                            "Epic",
                            retrieveUrlForIssue(epic.getKey(), (User) connectedUser.getPrincipal())
                    );
                }
        ).toList();
    }

    public List<UserStoryDto> getAllUserStoriesForProject(String projectKey, Authentication connectedUser) {
        List<JiraIssue> allStories = retrieveAllIssuesOfType(projectKey, "Story", (User) connectedUser.getPrincipal());
        return allStories.stream().map(story -> new UserStoryDto(
                        story.getKey(),
                        story.getFields().getSummary(),
                        story.getFields().getDescription() != null ? story.getFields().getDescription().getPlainText() : "",
                        story.getFields().getAssignee() != null ? story.getFields().getAssignee().getDisplayName() : "Unassigned",
                        story.getFields().getStatus().getName(),
                        retrieveStatusCategoryKey(story.getFields()),
                        story.getFields().getPriority() != null ? story.getFields().getPriority().getName() : "",
                        story.getFields().getDuedate(),
                        retrieveUserStoryProgress(story.getFields()),
                        story.getFields().getSubtasks().size(),
                        "Story",
                        retrieveUrlForIssue(story.getKey(), (User) connectedUser.getPrincipal())
                )
        ).toList();
    }

    public List<SubtaskDto> getAllSubtasksForProject(String projectKey, Authentication connectedUser) {
        List<JiraIssue> allSubtasks = retrieveAllIssuesOfType(projectKey, "Sub-task", (User) connectedUser.getPrincipal());
        return allSubtasks.stream().map(subtask -> new SubtaskDto(
                subtask.getKey(),
                subtask.getFields().getSummary(),
                subtask.getFields().getDescription() != null ? subtask.getFields().getDescription().getPlainText() : "",
                subtask.getFields().getAssignee() != null ? subtask.getFields().getAssignee().getDisplayName() : "Unassigned",
                subtask.getFields().getStatus().getName(),
                retrieveStatusCategoryKey(subtask.getFields()),
                subtask.getFields().getPriority() != null ? subtask.getFields().getPriority().getName() : "",
                subtask.getFields().getDuedate(),
                "Task",
                retrieveUrlForIssue(subtask.getKey(), (User) connectedUser.getPrincipal())
        )).toList();
    }

    public EpicDto retrieveEpicInformationFromJira(String projectKey, String storyId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        JiraIssue linkedEpic = retrieveIssueWithId(projectKey, storyId, user);
        if (linkedEpic == null) {
            throw new IllegalArgumentException("No Jira issue found with the provided Key.");
        }
        JiraIssueFields fields = linkedEpic.getFields();
        JiraProgress progress = retrieveProgressForEpic(linkedEpic.getKey(), user);
        return new EpicDto(
                linkedEpic.getKey(),
                fields.getSummary(),
                fields.getDescription() != null ? fields.getDescription().getPlainText() : "",
                fields.getStatus() != null ? fields.getStatus().getName() : "",
                retrieveStatusCategoryKey(fields),
                fields.getDuedate(),
                progress != null && progress.getTotal() != 0 ? ((double) progress.getProgress() / progress.getTotal()) : 0.0,
                progress != null ? progress.getTotal() : 0,
                "Epic",
                retrieveUrlForIssue(linkedEpic.getKey(), user));
    }

    public UserStoryDto retrieveStoryInformationFromJira(String projectKey, String storyId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        JiraIssue linkedStory = retrieveIssueWithId(projectKey, storyId, user);
        if (linkedStory == null) {
            throw new IllegalArgumentException("No Jira issue found with the provided Key.");
        }
        JiraIssueFields fields = linkedStory.getFields();
        return new UserStoryDto(
                linkedStory.getKey(),
                fields.getSummary(),
                fields.getDescription() != null ? fields.getDescription().getPlainText() : "",
                fields.getAssignee() != null ? fields.getAssignee().getDisplayName() : "Unassigned",
                fields.getStatus() != null ? fields.getStatus().getName() : "",
                retrieveStatusCategoryKey(fields),
                fields.getPriority() != null ? fields.getPriority().getName() : "",
                fields.getDuedate(),
                retrieveUserStoryProgress(fields),
                !CollectionUtils.isEmpty(fields.getSubtasks()) ? fields.getSubtasks().size() : 0,
                "Story",
                retrieveUrlForIssue(linkedStory.getKey(), user)
        );
    }

    private double retrieveUserStoryProgress(JiraIssueFields fields) {
        if (CollectionUtils.isEmpty(fields.getSubtasks())) {
            JiraStatus userStoryStatus = fields.getStatus();
            if (userStoryStatus != null && userStoryStatus.getStatusCategory() != null) {
                return userStoryStatus.getStatusCategory().getId() == JIRA_CLOUD_STATUS_CATEGORY_DONE_ID ? 1.0 : 0.0;
            }
            return 0.0;
        }
        return (double) countNumberOfFinishedIssues(fields.getSubtasks()) / fields.getSubtasks().size();
    }

    public SubtaskDto retrieveSubtaskInformationFromJira(String projectKey, String storyId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        JiraIssue linkedSubtask = retrieveIssueWithId(projectKey, storyId, user);
        if (linkedSubtask == null) {
            throw new IllegalArgumentException("No Jira issue found with the provided Key.");
        }
        JiraIssueFields fields = linkedSubtask.getFields();
        return new SubtaskDto(
                linkedSubtask.getKey(),
                fields.getSummary(),
                fields.getDescription() != null ? fields.getDescription().getPlainText() : "",
                fields.getAssignee() != null ? fields.getAssignee().getDisplayName() : "Unassigned",
                fields.getStatus() != null ? fields.getStatus().getName() : "",
                retrieveStatusCategoryKey(fields),
                fields.getPriority() != null ? fields.getPriority().getName() : "",
                fields.getDuedate(),
                "Task",
                retrieveUrlForIssue(linkedSubtask.getKey(), user));
    }

    private String retrieveStatusCategoryKey(JiraIssueFields fields) {
        if (fields == null || fields.getStatus() == null || fields.getStatus().getStatusCategory() == null) {
            return "new";
        }
        return fields.getStatus().getStatusCategory().getKey();
    }

    private JiraProgress retrieveProgressForEpic(String epicKey, User user) {
        String cloudId = jiraIdentificationProvider.getCloudId(user.getEmail()).getCloudId();
        String authHeader = getBearerAuthenticationHeader(user);
        JiraIssueSearchResponse response = jiraApiClient.get()
                .uri(cloudId + "/rest/api/3/search/jql?jql=parent=" + epicKey + "&fields=*all")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .retrieve()
                .body(JiraIssueSearchResponse.class);
        if (response == null || response.getIssues().isEmpty()) {
            return null;
        }
        JiraProgress progress = new JiraProgress();
        progress.setTotal(response.getIssues().size());
        progress.setProgress(countNumberOfFinishedIssues(response.getIssues()));
        return progress;
    }

    private int countNumberOfFinishedIssues(List<JiraIssue> issues) {
        return issues.stream()
                .filter(issue -> issue.getFields().getStatus() != null && issue.getFields().getStatus().getStatusCategory() != null)
                .filter(issue -> {
                    int id = issue.getFields().getStatus().getStatusCategory().getId();
                    return JIRA_CLOUD_STATUS_CATEGORY_DONE_ID == id;
                })
                .toList().size();
    }

    private String retrieveUrlForIssue(String issueKey, User user) {
        String cloudId = jiraIdentificationProvider.getCloudId(user.getEmail()).getCloudId();
        String authHeader = getBearerAuthenticationHeader(user);
        JiraServerInfoResponse response = jiraApiClient.get()
                .uri(cloudId + "/rest/api/2/serverInfo")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .retrieve()
                .body(JiraServerInfoResponse.class);
        if (response == null) {
            return null;
        }
        return response.getBaseUrl() + "/browse/" + issueKey;
    }

    private List<JiraIssue> retrieveAllIssuesOfType(String projectKey, String issueType, User user) {
        String cloudId = jiraIdentificationProvider.getCloudId(user.getEmail()).getCloudId();
        String authHeader = getBearerAuthenticationHeader(user);
        String nextPageToken = null;
        boolean firstPage = true;
        int maxResults = 50;
        List<JiraIssue> allIssues = new ArrayList<>();

        while (true) {
            String uri = cloudId + "/rest/api/3/search/jql?jql=project=" + projectKey + "&maxResults=" + maxResults + "&fields=*all";
            if (!firstPage) {
                uri += "&nextPageToken=" + nextPageToken;
            }
            JiraIssueSearchResponse response = jiraApiClient.get()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .body(JiraIssueSearchResponse.class);

            if (response != null && response.getIssues() != null) {
                List<JiraIssue> issues = response.getIssues().stream()
                        .filter(issue -> issueType.equals(issue.getFields().getIssuetype().getName()))
                        .toList();
                allIssues.addAll(issues);

                if (response.isLast() || response.getIssues().size() < maxResults) {
                    break; // No more results to fetch
                }
            } else {
                break; // Exit if response or issues are null
            }
            nextPageToken = response.getNextPageToken();
            firstPage = false;
        }
        return allIssues;
    }

    private JiraIssue retrieveIssueWithId(String projectKey, String issueKey, User user) {
        String cloudId = jiraIdentificationProvider.getCloudId(user.getEmail()).getCloudId();
        String authHeader = getBearerAuthenticationHeader(user);
        String nextPageToken = null;
        boolean firstPage = true;
        int maxResults = 50;

        while (true) {
            String uri = cloudId + "/rest/api/3/search/jql?jql=project=" + projectKey + "&maxResults=" + maxResults + "&fields=*all";
            if (!firstPage) {
                uri += "&nextPageToken=" + nextPageToken;
            }
            JiraIssueSearchResponse response = jiraApiClient.get()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .body(JiraIssueSearchResponse.class);

            if (response != null && response.getIssues() != null) {
                JiraIssue linkedIssue = response.getIssues().stream()
                        .filter(issue -> issueKey.equals(issue.getKey()))
                        .findFirst()
                        .orElse(null);
                if (linkedIssue != null) {
                    return linkedIssue;
                }
                if (response.isLast() || response.getIssues().size() < maxResults) {
                    break; // No more results to fetch
                }
            } else {
                break; // Exit if response or issues are null
            }
            nextPageToken = response.getNextPageToken();
            firstPage = false;
        }

        return null;
    }

    private String getBearerAuthenticationHeader(User user) {
        JiraAccessToken apiToken = jiraIdentificationProvider.getApiToken(user.getEmail());
        return "Bearer " + apiToken.getAccessToken();
    }
}
