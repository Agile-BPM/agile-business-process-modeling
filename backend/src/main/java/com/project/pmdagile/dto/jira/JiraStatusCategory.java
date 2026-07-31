package com.project.pmdagile.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraStatusCategory {
    private String self;
    private int id;
    private String key;
    private String colorName;
    private String name;
}
