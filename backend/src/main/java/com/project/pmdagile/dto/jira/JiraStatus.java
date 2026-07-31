package com.project.pmdagile.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraStatus {
    private String self;
    private String description;
    private String iconUrl;
    private String name;
    private String id;
    private JiraStatusCategory statusCategory;
}
