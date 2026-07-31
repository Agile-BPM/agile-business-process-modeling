package com.project.pmdagile.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraProject {
    private String expand;
    private String self;
    private String id;
    private String key;
    private String name;
    private String projectTypeKey;
    private boolean simplified;
    private String style;
    private boolean isPrivate;
    private Map<String, Object> properties;
    private String entityId;
    private String uuid;
}