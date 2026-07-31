package com.project.pmdagile.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraUser {
    private String self;
    private String accountId;
    private String emailAddress;
    private String displayName;
    private boolean active;
    private String timeZone;
    private String accountType;
}
