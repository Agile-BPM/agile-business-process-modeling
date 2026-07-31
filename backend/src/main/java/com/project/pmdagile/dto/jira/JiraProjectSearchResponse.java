package com.project.pmdagile.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraProjectSearchResponse {
    private String self;
    private int maxResults;
    private int startAt;
    private int total;
    private boolean isLast;
    private List<JiraProject> values;
}