package com.project.pmdagile.dto.jira;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraContent {
    String type;
    String text;
    List<JiraContent> content;
}
