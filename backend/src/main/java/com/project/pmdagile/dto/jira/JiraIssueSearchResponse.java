package com.project.pmdagile.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraIssueSearchResponse {
    private String expand;
    private int startAt;
    private String nextPageToken;
    boolean isLast;
    private int maxResults;
    private int total;
    private List<JiraIssue> issues;
}
