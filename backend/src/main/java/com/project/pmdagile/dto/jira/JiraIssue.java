package com.project.pmdagile.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraIssue {
    private String expand;
    private String id;
    private String self;
    private String key;
    private JiraIssueFields fields;
}
