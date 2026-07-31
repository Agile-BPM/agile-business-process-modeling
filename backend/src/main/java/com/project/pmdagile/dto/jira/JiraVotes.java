package com.project.pmdagile.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraVotes {
    private String self;
    private int votes;
    private boolean hasVoted;
}
